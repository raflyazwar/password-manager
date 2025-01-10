import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Eye, EyeOff, Copy, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Password {
  id: string;
  name: string;
  category: string;
  email?: string;
  phone?: string;
  password: string;
  userId: string;
}

interface PasswordListProps {
  userId: string;
  searchQuery: string;
}

const categories = [
  { id: 'game', name: 'Game', color: 'bg-purple-100 dark:bg-purple-900 border-purple-200 dark:border-purple-800' },
  { id: 'social', name: 'Social Media', color: 'bg-blue-100 dark:bg-blue-900 border-blue-200 dark:border-blue-800' },
  { id: 'other', name: 'Lainnya', color: 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800' }
];

export default function PasswordList({ userId, searchQuery }: PasswordListProps) {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [editingPassword, setEditingPassword] = useState<Password | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showEditConfirm, setShowEditConfirm] = useState<Password | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'passwords'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const passwordList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Password));
      setPasswords(passwordList);
    });

    return () => unsubscribe();
  }, [userId]);

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const copyAllDetails = async (password: Password) => {
    try {
      const details = [
        `Username: ${password.name}`,
        password.email && `Email: ${password.email}`,
        password.phone && `Phone: ${password.phone}`,
        `Password: ${password.password}`
      ].filter(Boolean).join('\n');
      
      await navigator.clipboard.writeText(details);
      toast.success('All details copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy details');
    }
  };

  const initiateDelete = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const deletePassword = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'passwords', id));
      setShowDeleteConfirm(null);
      toast.success('Password deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete password');
    }
  };

  const initiateUpdate = (password: Password) => {
    setShowEditConfirm(password);
  };

  const updatePassword = async (id: string, newName: string, newCategory: string, newEmail: string | undefined, newPhone: string | undefined, newPassword: string) => {
    try {
      const data: any = {
        name: newName,
        category: newCategory,
        password: newPassword
      };
      
      if (newEmail?.trim()) data.email = newEmail.trim();
      if (newPhone?.trim()) data.phone = newPhone.trim();
      
      await updateDoc(doc(db, 'passwords', id), data);
      setEditingPassword(null);
      setShowEditConfirm(null);
      toast.success('Password updated successfully!');
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  const generatePassword = () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    if (editingPassword) {
      setEditingPassword({ ...editingPassword, password: result });
    }
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.color || categories[2].color;
  };

  const filteredPasswords = passwords.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3 md:space-y-4">
      {filteredPasswords.map(password => {
        const categoryColor = getCategoryColor(password.category);
        
        return (
          <div key={password.id} className={`${categoryColor} border rounded-lg shadow-sm md:shadow`}>
            {editingPassword?.id === password.id ? (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editingPassword.name}
                    onChange={e => setEditingPassword({...editingPassword, name: e.target.value})}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-left flex items-center justify-between"
                    >
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getCategoryColor(editingPassword.category)} text-gray-800 dark:text-gray-200`}>
                        {categories.find(c => c.id === editingPassword.category)?.name}
                      </span>
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md py-1">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setEditingPassword({...editingPassword, category: cat.id});
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2 ${
                              editingPassword.category === cat.id ? 'bg-gray-50 dark:bg-gray-600' : ''
                            }`}
                          >
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${cat.color} text-gray-800 dark:text-gray-200`}>
                              {cat.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={editingPassword.email || ''}
                    onChange={e => setEditingPassword({...editingPassword, email: e.target.value})}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={editingPassword.phone || ''}
                    onChange={e => setEditingPassword({...editingPassword, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={visiblePasswords.has(password.id) ? 'text' : 'password'}
                        value={editingPassword.password}
                        onChange={e => setEditingPassword({...editingPassword, password: e.target.value})}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(password.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                      >
                        {visiblePasswords.has(password.id) ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => initiateUpdate(editingPassword)}
                    className="flex-1 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingPassword(null)}
                    className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                  <div className="space-y-1 mb-3 md:mb-0">
                    <div className="flex items-center justify-between md:justify-start">
                      <p className="text-gray-900 dark:text-white text-lg">
                        <span className="font-medium">Username: </span>{password.name}
                      </p>
                      <div className="flex gap-2 md:hidden">
                        <button
                          onClick={() => togglePasswordVisibility(password.id)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          {visiblePasswords.has(password.id) ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button
                          onClick={() => copyAllDetails(password)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <Copy size={18} />
                        </button>
                      </div>
                    </div>
                    {password.email && (
                      <p className="text-gray-600 dark:text-gray-300">{password.email}</p>
                    )}
                    {password.phone && (
                      <p className="text-gray-600 dark:text-gray-300">{password.phone}</p>
                    )}
                    <p className="text-gray-900 dark:text-white font-mono">
                      {visiblePasswords.has(password.id) ? password.password : '•'.repeat(8)}
                    </p>
                  </div>

                  {/* Desktop Actions */}
                  <div className="hidden md:flex gap-2">
                    <button
                      onClick={() => togglePasswordVisibility(password.id)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {visiblePasswords.has(password.id) ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <button
                      onClick={() => copyAllDetails(password)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <Copy size={20} />
                    </button>
                    <button
                      onClick={() => setEditingPassword(password)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => initiateDelete(password.id)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="mt-3 flex flex-col space-y-2 md:hidden">
                  <div className="flex justify-between">
                    <button
                      onClick={() => setEditingPassword(password)}
                      className="flex-1 py-2 text-blue-500 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => initiateDelete(password.id)}
                      className="flex-1 py-2 text-red-500 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => copyToClipboard(password.name, 'Username')}
                      className="py-1.5 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md"
                    >
                      Copy Username
                    </button>
                    {password.email && (
                      <button
                        onClick={() => copyToClipboard(password.email!, 'Email')}
                        className="py-1.5 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md"
                      >
                        Copy Email
                      </button>
                    )}
                    {password.phone && (
                      <button
                        onClick={() => copyToClipboard(password.phone!, 'Phone')}
                        className="py-1.5 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md"
                      >
                        Copy Phone
                      </button>
                    )}
                    <button
                      onClick={() => copyToClipboard(password.password, 'Password')}
                      className="py-1.5 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md"
                    >
                      Copy Password
                    </button>
                  </div>
                </div>

                {/* Desktop Copy Buttons */}
                <div className="hidden md:flex gap-2 flex-wrap mt-2">
                  <button
                    onClick={() => copyToClipboard(password.name, 'Username')}
                    className="text-sm px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                  >
                    Copy Username
                  </button>
                  {password.email && (
                    <button
                      onClick={() => copyToClipboard(password.email!, 'Email')}
                      className="text-sm px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                    >
                      Copy Email
                    </button>
                  )}
                  {password.phone && (
                    <button
                      onClick={() => copyToClipboard(password.phone!, 'Phone')}
                      className="text-sm px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                    >
                      Copy Phone
                    </button>
                  )}
                  <button
                    onClick={() => copyToClipboard(password.password, 'Password')}
                    className="text-sm px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                  >
                    Copy Password
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Apakah kamu yakin ingin menghapus ini dari daftar?
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Batal
              </button>
              <button
                onClick={() => deletePassword(showDeleteConfirm)}
                className="flex-1 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Confirmation Modal */}
      {showEditConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Apakah kamu yakin ingin melakukan perubahan ini?
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => setShowEditConfirm(null)}
                className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Batal
              </button>
              <button
                onClick={() => updatePassword(
                  showEditConfirm.id,
                  showEditConfirm.name,
                  showEditConfirm.category,
                  showEditConfirm.email,
                  showEditConfirm.phone,
                  showEditConfirm.password
                )}
                className="flex-1 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Yakin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}