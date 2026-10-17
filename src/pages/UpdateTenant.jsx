import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

import {
    getTenant,
    updateTenant
} from "../api/tenantApi";

import ErrorMessage from "../components/ErrorMessage";
import Header from "../components/Header";
import Footer from "../components/Footer";


const inputClass =
    "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

const labelClass =
    "mb-1.5 block text-sm font-semibold text-slate-700";

const emptyForm = {
    name: "",
    email: "",
    mobile: "",
    address: ""
};


export default function UpdateTenant() {

    const { tenantId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(emptyForm);
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {

        let ignore = false;

        async function loadTenant() {

            setLoading(true);
            setError(null);

            try {

                const response = await getTenant(tenantId);
                const tenant = response?.data || response;

                if (!ignore) {
                    setForm({
                        name: tenant?.name || "",
                        email: tenant?.email || "",
                        mobile: tenant?.mobile || "",
                        address: tenant?.address || ""
                    });
                }

            } catch (fetchError) {

                if (!ignore) {
                    setError(fetchError);
                }

            } finally {

                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        loadTenant();

        return () => {
            ignore = true;
        };

    }, [tenantId]);

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
        setSaving(true);

        try {

            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value);
            });
            if (profileImage) {
                formData.append("profileImage", profileImage);
            }

            await updateTenant(tenantId, formData);
            navigate(`/tenants/${tenantId}`);

        } catch (submitError) {

            setError(submitError);

        } finally {

            setSaving(false);
        }
    }

    return (

        <div className="flex min-h-screen flex-col bg-slate-50">

            <Header />

            <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">

                <div className="mb-6 flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold text-slate-900">Update Tenant</h2>
                    <Link
                        to={`/tenants/${tenantId}`}
                        className="text-sm font-semibold text-slate-500 hover:text-slate-700"
                    >
                        &larr; Back to Details
                    </Link>
                </div>

                <ErrorMessage error={error} />

                {loading ? (
                    <p className="text-sm text-slate-500">Loading tenant...</p>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="max-w-2xl rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-100"
                    >
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Mobile</label>
                                <input
                                    type="tel"
                                    name="mobile"
                                    value={form.mobile}
                                    onChange={handleChange}
                                    required
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className={labelClass}>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="profileImage" className={labelClass}>Profile Image</label>
                                <input
                                    id="profileImage"
                                    type="file"
                                    name="profileImage"
                                    accept="image/*"
                                    onChange={(event) => setProfileImage(event.target.files?.[0] || null)}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="mt-7 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                )}

            </main>

            <Footer />

        </div>
    );
}