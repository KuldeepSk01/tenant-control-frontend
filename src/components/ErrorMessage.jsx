import { ApiError } from "../api/ApiError";

/*
 * Renders an error coming from an API call (ApiError, plain Error, or string).
 * Renders nothing when there is no error.
 */
export default function ErrorMessage({ error }) {

    if (!error) {
        return null;
    }

    const message =
        error instanceof ApiError
            ? error.message
            : error instanceof Error
                ? error.message
                : error;

    const fieldErrors =
        error instanceof ApiError && error.errors
            ? Object.values(error.errors).flat()
            : [];

    return (

        <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >

            <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
            </svg>

            <div>

                <p className="font-medium">
                    {message}
                </p>

                {fieldErrors.length > 0 && (

                    <ul className="mt-1 list-disc space-y-0.5 pl-4">
                        {fieldErrors.map((fieldError, index) => (
                            <li key={index}>
                                {fieldError}
                            </li>
                        ))}
                    </ul>

                )}

            </div>

        </div>
    );
}
