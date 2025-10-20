import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import {
    LayoutDashboard,
    Receipt,
    Wallet,
    FolderOpen,
    LogOut,
    Menu,
    X,
    User,
} from 'lucide-react';

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Transactions', href: '/transactions', icon: Receipt },
        { name: 'Budgets', href: '/budgets', icon: Wallet },
        { name: 'Categories', href: '/categories', icon: FolderOpen },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar backdrop (mobile) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-6 border-b">
                        <div className="flex items-center space-x-2">
                            <div className="bg-primary rounded-lg p-2">
                                <Wallet className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">
                                Budget Tracker
                            </span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden"
                        >
                            <X className="h-6 w-6 text-gray-500" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                        ? 'bg-primary text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                            >
                                <item.icon className="h-5 w-5 mr-3" />
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User info */}
                    <div className="border-t p-4">
                        <div className="flex items-center mb-3">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                                    <User className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.first_name} {user?.last_name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="w-full"
                            size="sm"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-col flex-1 min-h-screen lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-10 bg-white border-b h-16 flex items-center px-4 lg:px-8">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden mr-4"
                    >
                        <Menu className="h-6 w-6 text-gray-500" />
                    </button>

                    <div className="flex-1">
                        <h1 className="text-lg font-semibold text-gray-900">
                            Welcome back, {user?.first_name || 'User'}!
                        </h1>
                    </div>
                </header>

                {/* Page content */}
                <main className="w-full max-w-[1600px] mx-auto flex-1 p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
