import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Edit2, Save, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(formData.avatar || '');

  useEffect(()=>{
    setPreviewUrl(formData.avatar || '');
  },[formData.avatar]);

  // Initialize form when user becomes available and handle redirect
  useEffect(() => {
    if (!user) return;
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      avatar: (user as any)?.avatar || '',
    });
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    // while redirecting, render nothing
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setAvatarFile(f);
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    }
  };

  const handleSave = async (): Promise<void> => {
    try {
      const updates: any = { name: formData.name, phone: formData.phone };
      // If a file was selected, upload it first to get a persisted URL
      if (avatarFile) {
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        const up = await fetch(`${API_BASE}/api/auth/avatar`, { method: 'POST', body: fd, credentials: 'include' });
        if (!up.ok) {
          const txt = await up.text().catch(()=>'');
          throw new Error('Avatar upload failed: ' + txt);
        }
        const j = await up.json();
        if (j && j.avatar) updates.avatar = j.avatar;
      } else if (formData.avatar) {
        updates.avatar = formData.avatar;
      }
      await updateProfile(updates);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">My Account</h1>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Account Information</h2>
              <p className="text-gray-600">
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 rounded border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <Label>Profile Photo</Label>
              <div className="flex items-center gap-4 mt-2">
                <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                  {previewUrl ? (
                    // eslint-disable-next-line jsx-a11y/img-redundant-alt
                    <img src={previewUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <Input
                  id="avatar"
                  name="avatar"
                  type="url"
                  placeholder="https://... (image URL)"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
                <input
                  id="avatarFile"
                  name="avatarFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={!isEditing}
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative mt-2">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-4 mb-8">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}

          <div className="pt-8 border-t">
            <h3 className="text-lg font-bold mb-4">Security</h3>
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                You can manage your account security and password settings below.
              </p>
              <Button variant="outline">Change Password</Button>
            </div>
          </div>

          <div className="pt-8 border-t">
            <h3 className="text-lg font-bold mb-4">Account Actions</h3>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Account Type
          </h3>
          <p className="text-gray-700">
            You are currently using a <span className="font-semibold">Customer Account</span>. 
            This account type allows you to browse products, add items to cart, and place orders.
          </p>
        </div>
      </div>
    </div>
  );
}
