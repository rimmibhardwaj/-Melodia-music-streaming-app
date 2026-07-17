import { Coffee, AlertCircle } from "lucide-react";
import { ApiError } from "@/hooks/useTracks";

interface ApiUnavailableProps {
  error: ApiError | null;
  className?: string;
}

export function ApiUnavailable({ error, className = "" }: ApiUnavailableProps) {
  if (!error) return null;

  const isQuota = error.type === 'QUOTA_EXCEEDED';

  return (
    <div className={`glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-4 min-h-[160px] ${className}`}>
      {isQuota ? (
        <Coffee className="text-[#FF3366] w-12 h-12 mb-2" />
      ) : (
        <AlertCircle className="text-red-400 w-12 h-12 mb-2" />
      )}
      
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white tracking-tight">
          {isQuota ? "Taking a short break" : "Something went wrong"}
        </h3>
        <p className="text-[#9D84C7] max-w-sm mx-auto text-sm">
          {isQuota 
            ? "We've hit our YouTube API limits for now. Check back a little later!"
            : "We couldn't fetch these tracks right now. Please try again."}
        </p>
      </div>
    </div>
  );
}
