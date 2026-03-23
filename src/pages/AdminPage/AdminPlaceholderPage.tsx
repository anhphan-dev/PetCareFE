import { Link } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';

type AdminPlaceholderPageProps = {
  title: string;
  description: string;
};

export default function AdminPlaceholderPage({ title, description }: AdminPlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            <Construction className="h-3.5 w-3.5" />
            Module đang hoàn thiện
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900 lg:text-3xl">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

          <div className="mt-6">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Về dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
