import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'elder',
    address: '',
    emergencyContact: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        if (value.length > 50) return 'Name must not exceed 50 characters';
        return '';
      
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please provide a valid email address';
        return '';
      
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) return 'Please provide a valid phone number';
        return '';
      
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
        return '';
      
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      
      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.length > 200) return 'Address must not exceed 200 characters';
        return '';
      
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Validate field in real-time if it has been touched
    if (touched[name]) {
      setErrors({
        ...errors,
        [name]: validateField(name, value)
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
    setErrors({
      ...errors,
      [name]: validateField(name, value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'emergencyContact') { // emergencyContact is optional
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    // If there are validation errors, show them and return
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(`Validation Error: ${firstError}`, 6000);
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      const result = await register(registrationData);
      
      if (result.success) {
        toast.success('Registration successful! Welcome to Emergency SOS!', 4000);
        navigate(result.user.role === 'elder' ? '/elder' : '/caregiver');
      } else {
        // Handle backend validation errors
        if (result.errors && Array.isArray(result.errors)) {
          const errorMessages = result.errors.map(err => err.msg).join(', ');
          toast.error(`Registration failed: ${errorMessages}`, 7000);
        } else {
          toast.error(result.message || 'Registration failed. Please try again.', 6000);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(`Registration failed: ${errorMessages}`, 7000);
      } else if (error.response?.data?.message) {
        toast.error(`Registration failed: ${error.response.data.message}`, 7000);
      } else {
        toast.error('Registration failed. Please check your connection and try again.', 7000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-emergency-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">🚨</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Emergency SOS
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your account
          </p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {/* Validation Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Registration Requirements:</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• All fields marked with (*) are required</li>
              <li>• Password must be secure (see requirements below)</li>
              <li>• Phone number must be valid</li>
              <li>• Email must be unique</li>
            </ul>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-emergency-500 focus:border-emergency-500 sm:text-sm ${
                errors.name && touched.name 
                  ? 'border-red-500 placeholder-red-300' 
                  : 'border-gray-300 placeholder-gray-500'
              } text-gray-900`}
              placeholder="Enter your full name (2-50 characters)"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.name && touched.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Must be between 2 and 50 characters</p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-emergency-500 focus:border-emergency-500 sm:text-sm ${
                errors.email && touched.email 
                  ? 'border-red-500 placeholder-red-300' 
                  : 'border-gray-300 placeholder-gray-500'
              } text-gray-900`}
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Must be a valid email address</p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-emergency-500 focus:border-emergency-500 sm:text-sm ${
                errors.phone && touched.phone 
                  ? 'border-red-500 placeholder-red-300' 
                  : 'border-gray-300 placeholder-gray-500'
              } text-gray-900`}
              placeholder="+1234567890 or 1234567890"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.phone && touched.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Enter a valid mobile phone number (with or without country code)</p>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Account Type
            </label>
            <select
              id="role"
              name="role"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-emergency-500 focus:border-emergency-500 sm:text-sm"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="elder">Elder (Person who may need help)</option>
              <option value="caregiver">Caregiver (Person who provides help)</option>
            </select>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address *
            </label>
            <textarea
              id="address"
              name="address"
              rows="2"
              required
              className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-emergency-500 focus:border-emergency-500 sm:text-sm ${
                errors.address && touched.address 
                  ? 'border-red-500 placeholder-red-300' 
                  : 'border-gray-300 placeholder-gray-500'
              } text-gray-900`}
              placeholder="123 Main St, City, State, Country"
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.address && touched.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Your residential address (max 200 characters)</p>
          </div>

          <div>
            <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">
              Emergency Contact <span className="text-gray-500">(Optional)</span>
            </label>
            <input
              id="emergencyContact"
              name="emergencyContact"
              type="text"
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emergency-500 focus:border-emergency-500 sm:text-sm"
              placeholder="John Doe: +1234567890"
              value={formData.emergencyContact}
              onChange={handleChange}
            />
            <p className="mt-1 text-xs text-gray-500">Alternative contact person and their phone number (optional)</p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-emergency-500 focus:border-emergency-500 sm:text-sm ${
                errors.password && touched.password 
                  ? 'border-red-500 placeholder-red-300' 
                  : 'border-gray-300 placeholder-gray-500'
              } text-gray-900`}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.password && touched.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
            <div className="mt-1 text-xs text-gray-500">
              <p>Password must contain:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li className={formData.password.length >= 6 ? 'text-green-600' : ''}>
                  At least 6 characters
                </li>
                <li className={/(?=.*[a-z])/.test(formData.password) ? 'text-green-600' : ''}>
                  One lowercase letter (a-z)
                </li>
                <li className={/(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : ''}>
                  One uppercase letter (A-Z)
                </li>
                <li className={/(?=.*\d)/.test(formData.password) ? 'text-green-600' : ''}>
                  One number (0-9)
                </li>
              </ul>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-emergency-500 focus:border-emergency-500 sm:text-sm ${
                errors.confirmPassword && touched.confirmPassword 
                  ? 'border-red-500 placeholder-red-300' 
                  : 'border-gray-300 placeholder-gray-500'
              } text-gray-900`}
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="mt-1 text-xs text-green-600">✓ Passwords match</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || Object.keys(errors).some(key => errors[key])}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emergency-600 hover:bg-emergency-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emergency-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
            {Object.keys(errors).some(key => errors[key]) && (
              <p className="mt-2 text-sm text-red-600 text-center">
                Please fix the validation errors above before submitting
              </p>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-emergency-600 hover:text-emergency-500"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;