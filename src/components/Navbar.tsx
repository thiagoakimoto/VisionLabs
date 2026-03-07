import React from 'react';

// Common Navbar component to be used across Astro pages
export const Navbar: React.FC = () => {
    return (
        <nav className="navbar">
            <a href="/" className="brand">
                <div className="brand-icon"></div>
                VisionLab
            </a>
            <div className="nav-center">
                <a href="#features" className="nav-link">Features <span className="arrow-down"></span></a>
                <a href="#how-it-works" className="nav-link">How it works</a>
                <a href="#pricing" className="nav-link">Pricing</a>
            </div>
            <a href="/login" className="btn-started">Sign In</a>
        </nav>
    );
};
