import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Logo } from '@/components/ui/logo';
import { getSupabaseForServer } from '@/supabase/getSupabaseForServer';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Script from 'next/script';
import { spaceTrim } from 'spacetrim';
import { getLandingPageMetadata } from './getLandingPageMetadata';
import { getShortcodeLink } from './getShortcodeLink';
import { Metadata } from 'next';

interface PageProps {
    params: { shortcode: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { shortcode } = params;
    const data = await getShortcodeLink(shortcode);

    if (!data || !data.landingPage) {
        return {};
    }

    const { title, description, image } = getLandingPageMetadata(data.landingPage);

    const metadata: Metadata = {};

    if (title) {
        metadata.title = title;
        metadata.openGraph = { ...metadata.openGraph, title };
    }

    if (description) {
        metadata.description = description;
        metadata.openGraph = { ...metadata.openGraph, description };
    }

    if (image) {
        metadata.openGraph = { ...metadata.openGraph, images: [{ url: image }] };
    }

    return metadata;
}

export default async function Page({ params }: PageProps) {
    const { shortcode } = params;

    if (!shortcode) {
        notFound();
    }

    try {
        const data = await getShortcodeLink(shortcode);

        if (!data || !data.url || data.url.length === 0) {
            notFound();
        }

        const headerList = headers();
        const userAgent = headerList.get('user-agent') ?? '';
        const referer = headerList.get('referer') ?? '';
        const ipHeader = headerList.get('x-forwarded-for') ?? '';
        const ip = ipHeader.split(',')[0];
        const language = headerList.get('accept-language') ?? '';
        const platform = headerList.get('sec-ch-ua-platform') ?? '';

        const randomIndex = Math.floor(Math.random() * data.url.length);
        const selectedUrl = data.url[randomIndex];

        if (!selectedUrl) {
            notFound();
        }

        if (data.landingPage) {
            const supabase = getSupabaseForServer();
            const { data: clickData, error: clickError } = await supabase
                .from('ShortcodeLinkClick')
                .insert({
                    shortcodeLinkId: data.id,
                    userAgent,
                    referer,
                    ip,
                    language,
                    platform,
                    navigatedAt: new Date().toISOString(),
                    clickedAt: null,
                })
                .select('id')
                .single();

            if (clickError) {
                console.error('Error creating click record:', clickError);
                // Note: Proceeding without click tracking if insertion fails
            }

            const clickId = clickData?.id;

            // Replace #url header with selectedUrl
            let landingContent = data.landingPage.replace(/^#url.*$/m, `# ${selectedUrl}`);

            // Check for existing link/button to selectedUrl or #url
            const linkRegex = new RegExp(
                `(\\[.*?\\]\\((?:${selectedUrl}|#url)\\))|(<a\\s+[^>]*href=["'](?:${selectedUrl}|#url)["'][^>]*>)|(<button[^>]*>(.|\\n)*?<\/button>)`,
                'i',
            );
            if (!linkRegex.test(landingContent)) {
                landingContent += spaceTrim(`
                    <p>
                        <a href="${selectedUrl}" class="inline-block bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition no-underline">
                            Go to link
                        </a>
                    </p>
                `);
            }

            const isBareHtml = data.landingPage.includes('<!DOCTYPE html>');

            const isBarePage = data.landingPage.includes('<!--no-template-->') || isBareHtml;

            const trackingScript = clickId
                ? `
                  const clickId = ${clickId};
                  document.body.addEventListener('click', (event) => {
                      let target = event.target;
                      while (target && target.tagName !== 'A') {
                          target = target.parentElement;
                      }
                      if (target && target.tagName === 'A') {
                          navigator.sendBeacon('/api/track-click', JSON.stringify({ clickId }));
                      }
                  });
              `
                : '';

            if (isBareHtml) {
                return (
                    <div className="flex items-center justify-center min-h-screen">
                        <div dangerouslySetInnerHTML={{ __html: landingContent }} />
                        <Script id="tracking-script">{trackingScript}</Script>
                    </div>
                );
            }

            const { MarkdownContent } = await import('@/components/utils/MarkdownContent/MarkdownContent');

            if (isBarePage) {
                return (
                    <div className="flex items-center justify-center min-h-screen">
                        <MarkdownContent>{landingContent}</MarkdownContent>
                        <Script id="tracking-script">{trackingScript}</Script>
                    </div>
                );
            }

            return (
                <div className="min-h-screen">
                    <Header />
                    <Logo />
                    <main className="container mx-auto px-6 py-8">
                        <MarkdownContent>{landingContent}</MarkdownContent>
                        <Footer />
                    </main>
                    <Script id="tracking-script">{trackingScript}</Script>
                </div>
            );
        } else {
            await getSupabaseForServer().from('ShortcodeLinkClick').insert({
                shortcodeLinkId: data.id,
                userAgent,
                referer,
                ip,
                language,
                platform,
                navigatedAt: new Date().toISOString(),
                clickedAt: new Date().toISOString(),
            });

            try {
                redirect(selectedUrl);
            } finally {
                return (
                    <div className="min-h-screen">
                        <Header />
                        <Logo />
                        <main className="container mx-auto px-6 py-8">
                            <div className="text-center">
                                Redirecting to: <Link href={selectedUrl}>{selectedUrl}</Link>
                            </div>
                            <Footer />
                            <Script id="redirect-script" strategy="beforeInteractive">
                                {`
                                window.location.href = "${selectedUrl}";
                            `}
                            </Script>
                        </main>
                    </div>
                );
            }
        }
    } catch (err) {
        console.error('Error processing shortcode:', err);
        notFound();
    }
}
