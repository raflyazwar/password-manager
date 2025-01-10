import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { Plus, Search, Moon, Sun, LogOut, Key } from 'lucide-react';
import AddPasswordModal from '../components/AddPasswordModal';
import PasswordList from '../components/PasswordList';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Mobile Header */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="px-4 h-16 flex items-center justify-between md:hidden">
          <div className="flex items-center space-x-2">
            <Key size={24} className="text-blue-500" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Passwords
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isDark ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <LogOut size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Desktop Header - Hidden on Mobile */}
      <nav className="hidden md:block bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Password Manager
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {isDark ? <Sun size={24} /> : <Moon size={24} />}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <LogOut size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Bar */}
      <div className="px-4 py-3 bg-white dark:bg-gray-800 md:bg-transparent md:dark:bg-transparent sticky top-16 md:top-0 z-10">
        <div className="relative max-w-7xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search passwords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 md:py-8 max-w-7xl mx-auto w-full">
        <PasswordList userId={user.uid} searchQuery={searchQuery} />
      </main>

      {/* Mobile FAB */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed right-4 bottom-4 md:hidden w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
      >
        <Plus size={24} />
      </button>

      {/* Desktop Add Button */}
      <div className="hidden md:block fixed bottom-8 right-8">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
        >
          <Plus size={20} />
          Add Password
        </button>
      </div>

      <AddPasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={user.uid}
      />
    </div>
  );
}