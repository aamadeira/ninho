import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useLiveUpdates() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const source = new EventSource("/api/live");
        let hasConnectedBefore = false;

        source.onopen = () => {
            if (hasConnectedBefore) {
                queryClient.invalidateQueries();
            }
            hasConnectedBefore = true;
        };

        source.onmessage = (message) => {
            const { topic } = JSON.parse(message.data);
            queryClient.invalidateQueries({ queryKey: [topic] });
        };

        return () => source.close();
    }, [queryClient]);
}
