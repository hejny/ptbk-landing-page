'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

interface TeamMember {
    name: string;
    role: string;
    bio: string;
    image: string;
    imagePosition?: string;  // Added this property to control image positioning
    link: string;
}

const TEAM_MEMBERS: TeamMember[] = [
    {
        name: "Pavol Hejný",
        role: "Founder",
        bio: "AI technology innovator and creator of Promptbook",
        image: "/people/pavol-hejny.jpg",
        link: "https://www.pavolhejny.com/"
    },
    {
        name: "Jiří Jahn",
        role: "Co-founder",
        bio: "AI enthusiast and developer",
        image: "/people/jiri-jahn.jpg",
        imagePosition: "center -10px",  // Adjust this value to move the image down
        link: "https://www.linkedin.com/in/jirkajahn/"
    }
];

export function AboutUsSection() {
    return (
        <section className="py-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

            <div className="container max-w-6xl mx-auto px-6 relative">
                <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {TEAM_MEMBERS.map((member) => (
                        <Link
                            href={member.link}
                            key={member.name}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Card className="group hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm">
                                <CardHeader className="space-y-4">
                                    <div className="flex justify-center">
                                        <div className="relative w-32 h-32 rounded-full overflow-hidden ring-2 ring-border group-hover:ring-primary transition-colors">
                                            <Image
                                                src={member.image}
                                                alt={member.name}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 128px) 100vw, 128px"
                                                style={{
                                                    objectPosition: member.imagePosition || 'center'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                                            {member.name}
                                        </CardTitle>
                                        <CardDescription className="text-lg font-medium">
                                            {member.role}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-center text-muted-foreground">
                                        {member.bio}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}