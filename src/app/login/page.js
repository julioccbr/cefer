"use client";
import { useEffect } from "react";
import { uspOAuthClient } from "@/lib/uspOAuthClient";

export default function LoginPage() {
    useEffect(() => {
        const startOAuth = async () => {
            const callbackUrl = typeof window !== "undefined" && window.location
                ? `${window.location.origin}/api/auth/usp/callback`
                : "";
            const result = await uspOAuthClient.authenticate(callbackUrl);
            if (typeof window !== "undefined") {
                window.location.href = result.authorizationUrl;
            }
        };
        startOAuth();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <h2 className="text-xl font-semibold text-gray-800">Redirecionando para o login USP...</h2>
        </div>
    );
} 