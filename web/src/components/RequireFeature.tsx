import { Navigate, Outlet } from "react-router";
import { useFeatures } from "../lib/queries";
import type { Feature } from "../lib/types";

interface RequireFeatureProps {
    feature: Feature;
}

export function RequireFeature({ feature }: RequireFeatureProps) {
    const features = useFeatures();

    if (!features.data?.includes(feature)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
