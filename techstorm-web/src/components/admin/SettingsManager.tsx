"use client";
import { useState, useTransition } from "react";
import { createUser, deleteUser, toggleUserStatus, updateUser } from "@/app/actions/user-management";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { updateGlobalSettings } from "@/app/actions/settings";
import { motion, AnimatePresence } from "framer-motion";
import { UserRole } from "@/types/user";

interface SettingsManagerProps {
  initialAdmins: any[];
  currentUser: any;
  initialGlobalSettings: any;
}

export default function SettingsManager({ initialAdmins, currentUser, initialGlobalSettings }: SettingsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("general");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmMaintenanceOpen, setIsConfirmMaintenanceOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Platform Settings State
  const [globalSettings, setGlobalSettings] = useState({
    platformName: initialGlobalSettings?.platformName || "TechStorm Global",
    supportEmail: initialGlobalSettings?.supportEmail || "Info@techstormglobal.com",
    maintenanceMode: initialGlobalSettings?.maintenanceMode || false,
  });

  const handleToggleMaintenance = async () => {
    setIsConfirmMaintenanceOpen(false);
    const newValue = !globalSettings.maintenanceMode;
    
    setGlobalSettings({...globalSettings, maintenanceMode: newValue});
    const result = await updateGlobalSettings({ 
        platformName: globalSettings.platformName,
        supportEmail: globalSettings.supportEmail,
        maintenanceMode: newValue 
    });
    if (result.success) {
        toast.success(`Platform is now ${newValue ? 'Under Maintenance' : 'Live'}`);
        startTransition(() => router.refresh());
    } else {
        setGlobalSettings({...globalSettings, maintenanceMode: !newValue}); // Revert
        toast.error("Failed to update status");
    }
  };

  const handleUpdateGeneral = async () => {
    setIsSubmitting(true);
    const result = await updateGlobalSettings({
        platformName: globalSettings.platformName,
        supportEmail: globalSettings.supportEmail,
        maintenanceMode: globalSettings.maintenanceMode
    });
    setIsSubmitting(false);

    if (result.success) {
        toast.success("General settings updated!");
        startTransition(() => router.refresh());
    } else {
        toast.error("Failed to save settings");
    }
  };

  // New Admin Form State
  const [adminData, setAdminData] = useState({ name: "", email: "" });

  // Profile State
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || "",
    image: currentUser?.image || "",
  });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploadingAvatar(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });
        
        if (!res.ok) throw new Error("Upload failed");
        
        const data = await res.json();
        setProfileData({ ...profileData, image: data.url });
        toast.success("Avatar uploaded! Click 'Update Profile' to save.");
    } catch (error) {
        console.error(error);
        toast.error("Failed to upload avatar");
    } finally {
        setIsUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!currentUser?.id) return;
    
    setIsSubmitting(true);
    const result = await updateUser(currentUser.id, {
        name: profileData.name,
        email: currentUser.email, // Email usually isn't editable here
        role: currentUser.role,
        image: profileData.image
    } as any); // Type casting as quick fix, better to update type definition
    setIsSubmitting(false);

    if (result.success) {
        toast.success("Profile updated successfully!");
        startTransition(() => router.refresh());
    } else {
        toast.error("Failed to update profile");
    }
  };

  const tabs = [
    { id: "general", name: "General Settings", icon: "fa-cog" },
    { id: "admins", name: "Administrators", icon: "fa-user-shield" },
    { id: "profile", name: "My Profile", icon: "fa-user-circle" },
    { id: "security", name: "Security", icon: "fa-shield-alt" },
  ];

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await createUser({ ...adminData, role: UserRole.ADMIN });
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Invitation sent successfully!");
      setIsModalOpen(false);
      setAdminData({ name: "", email: "" });
      startTransition(() => router.refresh());
    } else {
      toast.error(result.error || "Failed to add admin");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    if (id === currentUser?.id) {
        toast.error("You cannot suspend your own account.");
        return;
    }
    const result = await toggleUserStatus(id, currentStatus);
    if (result.success) {
      toast.success(`User ${result.newStatus === "ACTIVE" ? "activated" : "suspended"}`);
      startTransition(() => router.refresh());
    }
  };

  const handleDeleteClick = (id: string) => {
    if (id === currentUser?.id) {
        toast.error("You cannot delete your own account.");
        return;
    }
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    const result = await deleteUser(deleteId);
    if (result.success) {
      toast.success("Administrator removed");
      setDeleteId(null);
      startTransition(() => router.refresh());
    } else {
        toast.error("Failed to delete admin");
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-dark">Settings</h1>
        <p className="text-slate-500 mt-1">Configure platform parameters and manage the administrative team.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tabs Sidebar */}
        <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-brand-teal text-white shadow-lg shadow-brand-teal/20"
                  : "text-slate-500 hover:bg-white hover:text-brand-teal"
              }`}
            >
              <i className={`fas ${tab.icon} w-5 text-center`}></i>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === "general" && (
                <motion.div 
                    key="general"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="p-6 md:p-8 space-y-8"
                >
                    <div className="border-b border-slate-100 pb-4">
                        <h3 className="text-xl font-bold text-brand-dark">General Configuration</h3>
                        <p className="text-sm text-slate-500">Global platform settings and support info.</p>
                    </div>
                    <div className="grid gap-6 max-w-2xl">
                        <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Platform Name</label>
                        <input 
                            type="text" 
                            value={globalSettings.platformName} 
                            onChange={(e) => setGlobalSettings({...globalSettings, platformName: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-teal/10 focus:border-brand-teal outline-none" 
                        />
                        </div>
                        <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Support Email</label>
                        <input 
                            type="email" 
                            value={globalSettings.supportEmail} 
                            onChange={(e) => setGlobalSettings({...globalSettings, supportEmail: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-teal/10 focus:border-brand-teal outline-none" 
                        />
                        </div>
                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-between">
                            <div className="flex gap-3 items-center">
                                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                                    <i className="fas fa-tools"></i>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-amber-900">Maintenance Mode</p>
                                    <p className="text-xs text-amber-700">Disable public access to the platform</p>
                                </div>
                            </div>
                            <motion.button 
                                type="button"
                                onClick={() => setIsConfirmMaintenanceOpen(true)}
                                className={`w-14 h-7 rounded-full relative p-1 transition-colors duration-500 flex items-center ${globalSettings.maintenanceMode ? 'bg-brand-amber' : 'bg-slate-300'}`}
                            >
                                <motion.span 
                                    layout
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    className={`bg-white w-5 h-5 rounded-full shadow-md z-10 ${globalSettings.maintenanceMode ? 'ml-auto' : 'ml-0'}`}
                                />
                                {/* Optional background text icon */}
                                <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-black pointer-events-none">
                                    <span className={globalSettings.maintenanceMode ? "text-amber-900 opacity-20" : "opacity-0"}>ON</span>
                                    <span className={globalSettings.maintenanceMode ? "opacity-0" : "text-slate-500 opacity-40"}>OFF</span>
                                </div>
                            </motion.button>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100">
                        <button 
                            onClick={handleUpdateGeneral} 
                            disabled={isSubmitting}
                            className="bg-brand-dark text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-md disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </motion.div>
            )}

            {activeTab === "admins" && (
                <motion.div 
                    key="admins"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="p-6 md:p-8 space-y-6"
                >
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <div>
                            <h3 className="text-xl font-bold text-brand-dark">Platform Administrators</h3>
                            <p className="text-sm text-slate-500">Manage your internal team and permissions.</p>
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-brand-teal text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#006066] transition-colors flex items-center gap-2"
                        >
                            <i className="fas fa-plus"></i> Add Admin
                        </button>
                    </div>

                    <div className="overflow-hidden border border-slate-100 rounded-xl">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="p-4">Name & Email</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {initialAdmins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center font-bold text-xs">
                                                    {admin.name?.[0] || "A"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-brand-dark">{admin.name} {admin.id === currentUser?.id && <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 ml-1">YOU</span>}</p>
                                                    <p className="text-xs text-slate-400">{admin.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${admin.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {admin.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    disabled={admin.id === currentUser?.id}
                                                    onClick={() => handleToggleStatus(admin.id, admin.status)}
                                                    className="text-slate-300 hover:text-brand-amber disabled:opacity-0 transition-colors p-1"
                                                    title="Suspend/Activate"
                                                >
                                                    <i className="fas fa-user-slash text-xs"></i>
                                                </button>
                                                <button 
                                                    disabled={admin.id === currentUser?.id}
                                                    onClick={() => handleDeleteClick(admin.id)}
                                                    className="text-slate-300 hover:text-red-500 disabled:opacity-0 transition-colors p-1"
                                                    title="Delete"
                                                >
                                                    <i className="fas fa-trash-alt text-xs"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {activeTab === "profile" && (
                <motion.div 
                    key="profile"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="p-6 md:p-8 space-y-8"
                >
                    <div className="border-b border-slate-100 pb-4">
                        <h3 className="text-xl font-bold text-brand-dark">My Profile</h3>
                        <p className="text-sm text-slate-500">Update your personal administrative information.</p>
                    </div>
                    
                    <div className="flex items-center gap-8 mb-4">
                        <div className="relative w-24 h-24">
                            {profileData.image ? (
                                <img 
                                    src={profileData.image} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                                />
                            ) : (
                                <div className="w-full h-full bg-brand-teal/10 border-4 border-white shadow-lg rounded-full flex items-center justify-center text-brand-teal text-4xl font-black">
                                    {profileData.name?.[0] || "A"}
                                </div>
                            )}
                            {isUploadingAvatar && (
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                    <i className="fas fa-spinner fa-spin text-white"></i>
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <label className="cursor-pointer bg-slate-50 border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-white transition-all inline-block">
                                {isUploadingAvatar ? "Uploading..." : "Change Avatar"}
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleAvatarUpload}
                                    disabled={isUploadingAvatar}
                                />
                            </label>
                            <p className="text-[10px] text-slate-400 mt-2">Recommended: 200x200px, JPG/PNG</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
                        <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Name</label>
                        <input 
                            type="text" 
                            value={profileData.name}
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-teal/10 focus:border-brand-teal outline-none" 
                        />
                        </div>
                        <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Address</label>
                        <input type="email" disabled defaultValue={currentUser?.email} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
                        </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100">
                        <button 
                            onClick={handleUpdateProfile} 
                            disabled={isSubmitting || isUploadingAvatar}
                            className="bg-brand-teal text-white px-8 py-3 rounded-xl font-bold hover:bg-[#006066] transition-all shadow-lg shadow-brand-teal/20 disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : "Update Profile"}
                        </button>
                    </div>
                </motion.div>
            )}

            {activeTab === "security" && (
                <motion.div 
                    key="security"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="p-6 md:p-8 space-y-8"
                >
                    <div className="border-b border-slate-100 pb-4">
                        <h3 className="text-xl font-bold text-brand-dark">Security & Password</h3>
                        <p className="text-sm text-slate-500">Secure your account with a strong password.</p>
                    </div>
                    <div className="space-y-6 max-w-md">
                        <div className="space-y-4">
                        <input type="password" placeholder="Current Password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-teal" />
                        <input type="password" placeholder="New Password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-teal" />
                        <input type="password" placeholder="Confirm New Password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-teal" />
                        </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100">
                        <button onClick={() => toast.success("Password changed!")} className="bg-brand-dark text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-md">Update Password</button>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Admin Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Invite New Administrator"
      >
        <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Name</label>
                <input 
                    type="text" 
                    required 
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-brand-teal transition-colors"
                    value={adminData.name}
                    onChange={(e) => setAdminData({...adminData, name: e.target.value})}
                    placeholder="Enter full name"
                />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Address</label>
                <input 
                    type="email" 
                    required 
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-brand-teal transition-colors"
                    value={adminData.email}
                    onChange={(e) => setAdminData({...adminData, email: e.target.value})}
                    placeholder="Enter email address"
                />
            </div>
            <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg flex gap-2 items-start">
                <i className="fas fa-info-circle mt-0.5"></i>
                <p>The user will receive an email invitation to set their own password and activate their account.</p>
            </div>
            <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-50 text-slate-500 font-bold rounded-xl hover:bg-slate-100">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-brand-teal text-white font-bold rounded-xl hover:bg-[#006066] shadow-lg shadow-brand-teal/20 disabled:opacity-50">
                    {isSubmitting ? "Sending Invite..." : "Send Invitation"}
                </button>
            </div>
        </form>
      </Modal>

      {/* Maintenance Confirmation */}
              <ConfirmModal 
                  isOpen={isConfirmMaintenanceOpen}
                  onClose={() => setIsConfirmMaintenanceOpen(false)}
                  onConfirm={handleToggleMaintenance}
                  title={globalSettings.maintenanceMode ? "Bring Platform Online?" : "Enable Maintenance Mode?"}
                  confirmText={globalSettings.maintenanceMode ? "Go Live" : "Confirm"}
                  variant="teal"
                  message={globalSettings.maintenanceMode 
                      ? "This will restore public access to the platform for all users." 
                      : "Warning: This will block public access to the platform for all non-admin users. Students and mentors will see the maintenance page."
                  }
              />
              
              <ConfirmModal 
                isOpen={!!deleteId} 
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Remove Administrator?"
                message="This action cannot be undone. This admin will lose all access to the dashboard."
              />
      
    </div>
  );
}
