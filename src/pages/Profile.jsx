import {
    useState
} from "react";

import {
    enableAutogeneratebillApi,
    updateProfile
} from "../api/userApi";

import ErrorMessage from "../components/ErrorMessage";
import Footer from "../components/Footer";
import Header from "../components/Header";
import {
    useAuth
} from "../context/AuthContext";


const inputClass =
    "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

const labelClass =
    "mb-1.5 block text-sm font-semibold text-slate-700";


export default function Profile() {

    const {
        user,
        updateUser
    } = useAuth();

    const [form, setForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
        mobile: user?.mobile || ""
    });
    const [saving, setSaving] = useState(false);
    const [updatingAutoBill, setUpdatingAutoBill] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState("");

    function handleChange(event) {

        const { name, value } = event.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value
        }));
    }

    async function handleSubmit(event) {

        event.preventDefault();
        setError(null);
        setSuccess("");
        setSaving(true);

        try {

            const response = await updateProfile(form);
            const updatedProfile = response?.data || response;

            updateUser({
                ...user,
                ...form,
                ...(updatedProfile && typeof updatedProfile === "object"
                    ? updatedProfile
                    : {})
            });
            setSuccess("Profile updated successfully.");

        } catch (submitError) {

            setError(submitError);

        } finally {

            setSaving(false);
        }
    }

    async function handleAutoBillChange(event) {

        const enableAutoGenerateBill = event.target.checked;

        setError(null);
        setSuccess("");
        setUpdatingAutoBill(true);

        try {

            const response = await enableAutogeneratebillApi(
                enableAutoGenerateBill,
                user?.userId
            );
            const updatedSettings = response?.data || response;

            updateUser({
                ...user,
                enableAutoGenerateBill,
                ...(updatedSettings && typeof updatedSettings === "object"
                    ? updatedSettings
                    : {})
            });
            setSuccess(
                enableAutoGenerateBill
                    ? "Automatic bill generation enabled."
                    : "Automatic bill generation disabled."
            );

        } catch (settingsError) {

            setError(settingsError);

        } finally {

            setUpdatingAutoBill(false);
        }
    }

    const initials = (user?.name || "?")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

    return (

        <div className="flex min-h-screen flex-col bg-slate-50">

            <Header />

            <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">

                <div className="mb-7">
                    <p className="text-sm font-semibold text-indigo-600">Account</p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-900">Admin Profile</h2>
                    <p className="mt-1 text-sm text-slate-500">Manage the information shown across your admin account.</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">

                    <aside className="rounded-xl bg-slate-900 p-6 text-white lg:col-span-1">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-400 text-lg font-bold text-slate-950">
                            {initials}
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">{user?.name || "Admin"}</h3>
                        <p className="mt-1 text-sm text-slate-300">{user?.email || "No email address"}</p>

                        <dl className="mt-7 space-y-4 border-t border-slate-700 pt-5 text-sm">
                            <div>
                                <dt className="text-slate-400">Role</dt>
                                <dd className="mt-1 font-semibold">{user?.role || "Administrator"}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-400">Account ID</dt>
                                <dd className="mt-1 break-all font-semibold">{user?.userId || "Not available"}</dd>
                            </div>
                        </dl>
                    </aside>

                    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-2 sm:p-7">
                        <ErrorMessage error={error} />

                        {success && (
                            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className={labelClass} htmlFor="profile-name">Name</label>
                                <input id="profile-name" type="text" name="name" value={form.name} onChange={handleChange} required className={inputClass} />
                            </div>

                            <div>
                                <label className={labelClass} htmlFor="profile-email">Email</label>
                                <input id="profile-email" type="email" name="email" value={form.email} onChange={handleChange} required className={inputClass} />
                            </div>

                            <div>
                                <label className={labelClass} htmlFor="profile-mobile">Mobile</label>
                                <input id="profile-mobile" type="tel" name="mobile" value={form.mobile} onChange={handleChange} required className={inputClass} />
                            </div>

                            <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">Automatic bill generation</p>
                                    <p className="mt-1 text-sm text-slate-500">Generate electricity bills automatically when new readings are recorded.</p>
                                </div>

                                <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(user?.enableAutoGenerateBill)}
                                        onChange={handleAutoBillChange}
                                        disabled={updatingAutoBill || !user?.userId}
                                        className="peer sr-only"
                                    />
                                    <span className="h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-indigo-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition peer-checked:after:translate-x-5" />
                                    <span className="sr-only">Enable automatic bill generation</span>
                                </label>
                            </div>

                            <div className="flex justify-end border-t border-slate-100 pt-6">
                                <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </section>

                </div>

            </main>

            <Footer />

        </div>
    );
}