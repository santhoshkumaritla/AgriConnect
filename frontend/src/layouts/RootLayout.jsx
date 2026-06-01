import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GlobalRoleGuard from '../components/GlobalRoleGuard';

const RootLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-10">
        <GlobalRoleGuard />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
