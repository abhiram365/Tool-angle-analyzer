
import React from 'react';

const TierCard: React.FC<{ title: string; children: React.ReactNode; color: string }> = ({ title, children, color }) => (
    <div className={`border-l-4 ${color} bg-white dark:bg-zinc-900 p-6 rounded-r-xl shadow-lg border border-zinc-200 dark:border-zinc-800`}>
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-4 uppercase tracking-wider text-sm">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const Node: React.FC<{ icon: React.ReactNode; title: string; desc: string; tags?: string[] }> = ({ icon, title, desc, tags }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group">
        <div className="text-zinc-600 dark:text-zinc-400 group-hover:text-orange-500 transition-colors mt-1">
            {icon}
        </div>
        <div>
            <div className="flex items-center gap-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{title}</h4>
                {tags && tags.map(tag => (
                    <span key={tag} className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                        {tag}
                    </span>
                ))}
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">{desc}</p>
        </div>
    </div>
);

const CloudIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19c0-3.037-2.463-5.5-5.5-5.5S6.5 15.963 6.5 19"/><path d="M2 19c0-3.037 2.463-5.5 5.5-5.5s5.5 2.463 5.5 5.5"/><path d="M17.5 19h-11"/><path d="M12 13.5V4"/><path d="m15.5 7.5-3.5-3.5-3.5 3.5"/></svg>;
const ReactIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>;
const AuthIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const StorageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v14"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>;
const PubSubIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 9 4 2.5L5 14z"/><path d="m11 5 4 2.5L11 10z"/><path d="m11 14 4 2.5L11 19z"/><path d="M11 12h10"/></svg>;
const ComputeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>;
const BrainIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M12 8v-1"/><path d="M12 17v-1"/><path d="m15 9 1-1"/><path d="m16 17-1-1"/><path d="m9 9-1-1"/><path d="m8 17 1-1"/></svg>;
const DatabaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const GitIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M15 9.35a4.75 4.75 0 0 0-6 0"/></svg>;
const BuildIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;

export const ArchitectureView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-black/20">
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">System Architecture</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                        Commercial-grade, decoupled design on Google Cloud Platform.
                    </p>
                </div>
                <button 
                    onClick={onBack}
                    className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                    Close Design View
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Presentation Tier */}
                <TierCard title="Presentation Layer" color="border-blue-500">
                    <Node 
                        icon={<CloudIcon />} 
                        title="Firebase Hosting" 
                        desc="Low-latency global content delivery for static assets (React SPA)." 
                        tags={['CDN', 'HTTPS']}
                    />
                    <Node 
                        icon={<AuthIcon />} 
                        title="Firebase Authentication" 
                        desc="Secure identity management for user access control." 
                        tags={['OAuth', 'JWT']}
                    />
                </TierCard>

                {/* Processing Tier */}
                <TierCard title="Image Processing Core" color="border-orange-500">
                    <Node 
                        icon={<StorageIcon />} 
                        title="Cloud Storage" 
                        desc="Temporary ingestion bucket for raw high-res tool images." 
                        tags={['Object Store', 'Trigger']}
                    />
                    <Node 
                        icon={<PubSubIcon />} 
                        title="Cloud Pub/Sub" 
                        desc="Asynchronous messaging queue to decouple upload from processing." 
                        tags={['Async', 'Decoupled']}
                    />
                    <Node 
                        icon={<ComputeIcon />} 
                        title="Cloud Run Service" 
                        desc="Stateless container with OpenCV & Python. Scales to zero." 
                        tags={['2 vCPU', '4GB RAM', 'Auto-scale']}
                    />
                    <Node 
                        icon={<BrainIcon />} 
                        title="Gemini API" 
                        desc="Multimodal AI for feature extraction and tool classification." 
                        tags={['Vision', 'LLM']}
                    />
                </TierCard>

                {/* Data Tier */}
                <TierCard title="Data & Compliance" color="border-green-500">
                    <Node 
                        icon={<DatabaseIcon />} 
                        title="Cloud Firestore" 
                        desc="NoSQL document store for analysis reports, user history, and ASME standards." 
                        tags={['Managed', 'Real-time']}
                    />
                    <Node 
                        icon={<LockIcon />} 
                        title="Secret Manager" 
                        desc="Secure storage for API keys and database credentials." 
                        tags={['Encryption', 'IAM']}
                    />
                </TierCard>
            </div>

            <div className="mt-12 p-6 bg-zinc-900 rounded-xl border border-zinc-800 text-zinc-300">
                <div className="flex items-center gap-3 mb-4">
                    <BuildIcon />
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">CI/CD Pipeline</h3>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-zinc-700">
                        <GitIcon />
                        <span>GitHub Repository (Main Branch)</span>
                    </div>
                    <div className="hidden md:block text-zinc-600">➔</div>
                    <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-zinc-700">
                        <span className="font-bold text-blue-400">Cloud Build</span>
                        <span>Trigger Build & Test</span>
                    </div>
                    <div className="hidden md:block text-zinc-600">➔</div>
                     <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-zinc-700">
                        <span className="font-bold text-orange-400">Artifact Registry</span>
                        <span>Push Docker Image</span>
                    </div>
                    <div className="hidden md:block text-zinc-600">➔</div>
                    <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-zinc-700">
                        <span className="font-bold text-green-400">Cloud Run</span>
                        <span>Deploy Revision</span>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
};
