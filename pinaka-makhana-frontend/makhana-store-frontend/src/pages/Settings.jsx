import React, { useState } from 'react';
import { useAuth } from '../components/context/AuthContext';
import { useToast } from '../components/context/ToastContext';

const Settings = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderUpdates: true,
    promotionalEmails: false,
    weeklyNewsletter: true
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    currency: 'INR',
    timeZone: 'Asia/Kolkata',
    theme: 'light'
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showOrderHistory: false,
    shareDataForImprovement: true,
    allowCookies: true
  });

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePrivacyChange = (key, value) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // Here you would typically save to backend
    showSuccess('Settings saved successfully!');
  };

  const handleResetSettings = () => {
    setNotifications({
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      orderUpdates: true,
      promotionalEmails: false,
      weeklyNewsletter: true
    });
    setPreferences({
      language: 'en',
      currency: 'INR',
      timeZone: 'Asia/Kolkata',
      theme: 'light'
    });
    setPrivacy({
      profileVisibility: 'public',
      showOrderHistory: false,
      shareDataForImprovement: true,
      allowCookies: true
    });
    showSuccess('Settings reset to default!');
  };

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900">{label}</h4>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
          checked ? 'bg-red-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account preferences and privacy settings</p>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Notifications
            </h2>
            <p className="text-sm text-gray-600 mt-1">Control how you receive notifications</p>
          </div>
          <div className="p-6 space-y-4">
            <ToggleSwitch
              checked={notifications.emailNotifications}
              onChange={() => handleNotificationChange('emailNotifications')}
              label="Email Notifications"
              description="Receive notifications via email"
            />
            <ToggleSwitch
              checked={notifications.smsNotifications}
              onChange={() => handleNotificationChange('smsNotifications')}
              label="SMS Notifications"
              description="Receive text messages for important updates"
            />
            <ToggleSwitch
              checked={notifications.pushNotifications}
              onChange={() => handleNotificationChange('pushNotifications')}
              label="Push Notifications"
              description="Receive browser push notifications"
            />
            <ToggleSwitch
              checked={notifications.orderUpdates}
              onChange={() => handleNotificationChange('orderUpdates')}
              label="Order Updates"
              description="Get notified about order status changes"
            />
            <ToggleSwitch
              checked={notifications.promotionalEmails}
              onChange={() => handleNotificationChange('promotionalEmails')}
              label="Promotional Emails"
              description="Receive emails about offers and promotions"
            />
            <ToggleSwitch
              checked={notifications.weeklyNewsletter}
              onChange={() => handleNotificationChange('weeklyNewsletter')}
              label="Weekly Newsletter"
              description="Get weekly updates about new products"
            />
          </div>
        </div>

        {/* App Preferences */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              App Preferences
            </h2>
            <p className="text-sm text-gray-600 mt-1">Customize your app experience</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="mr">Marathi</option>
                <option value="gu">Gujarati</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={preferences.currency}
                onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
              <select
                value={preferences.timeZone}
                onChange={(e) => handlePreferenceChange('timeZone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="Asia/Kolkata">India Standard Time (IST)</option>
                <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="Europe/London">Greenwich Mean Time (GMT)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={preferences.theme === 'light'}
                    onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                    className="mr-3 text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <div className="font-medium">Light Theme</div>
                    <div className="text-sm text-gray-600">Clean and bright interface</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={preferences.theme === 'dark'}
                    onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                    className="mr-3 text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <div className="font-medium">Dark Theme</div>
                    <div className="text-sm text-gray-600">Easy on the eyes</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Privacy & Security
            </h2>
            <p className="text-sm text-gray-600 mt-1">Control your privacy and data sharing preferences</p>
          </div>
          <div className="p-6 space-y-4">
            <ToggleSwitch
              checked={privacy.showOrderHistory}
              onChange={() => handlePrivacyChange('showOrderHistory', !privacy.showOrderHistory)}
              label="Show Order History"
              description="Allow others to see your purchase history"
            />
            <ToggleSwitch
              checked={privacy.shareDataForImprovement}
              onChange={() => handlePrivacyChange('shareDataForImprovement', !privacy.shareDataForImprovement)}
              label="Share Data for Improvement"
              description="Help us improve our services by sharing anonymized data"
            />
            <ToggleSwitch
              checked={privacy.allowCookies}
              onChange={() => handlePrivacyChange('allowCookies', !privacy.allowCookies)}
              label="Allow Cookies"
              description="Enable cookies for better user experience"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSaveSettings}
            className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
          >
            Save All Settings
          </button>
          <button
            onClick={handleResetSettings}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Reset to Default
          </button>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-lg shadow-sm mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 text-red-600">Danger Zone</h2>
            <p className="text-sm text-gray-600 mt-1">Irreversible and destructive actions</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <h4 className="text-sm font-medium text-red-900">Delete Account</h4>
                <p className="text-sm text-red-700">Permanently delete your account and all data</p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
