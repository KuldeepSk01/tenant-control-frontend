export default function Footer() {

    return (

        <footer className="border-t border-indigo-100 bg-white/80 px-6 py-5 text-center text-xs font-medium text-slate-500 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400">
            <span className="text-slate-700 dark:text-slate-200">&copy; {new Date().getFullYear()} TenantControl.</span> All rights reserved.
        </footer>
    );
}
