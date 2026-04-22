import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import { Eye, EyeOff, Check, X, Camera, User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";

/* ─── Reusable form input (consistent with Login/Signup) ─── */
const FormInput = ({ label, type, placeholder, value, onChange, required = true }) => (
  <div className="mb-3">
    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {label}
    </label>
    <input
      type={type}
      className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BEA5] focus:border-transparent transition-all dark:bg-[#0f172a] dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
    />
  </div>
);

/* ─── Password validation UI helper (same as SignUpPage) ─── */
const ValidationItem = ({ label, met }) => (
  <div className={`flex items-center gap-1 ${met ? "text-green-500" : "text-gray-400"}`}>
    {met ? <Check size={10} /> : <X size={10} />}
    <span className="text-[10px]">{label}</span>
  </div>
);

const CompleteProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  // Graceful redirect: If profile is already complete, don't show the form
  useEffect(() => {
    if (user?.isProfileComplete) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const isGoogleUser = user?.isGoogleUser || !!user?.googleId;

  // Dynamic visibility logic:
  // 1. New Google Users: Show all fields (Names, Password, Bio, Avatar) for verification
  // 2. New Email Users: Only show missing setup (Avatar, Bio) as they already set names/password
  // 3. Existing Users: Only show whatever is missing in the database
  const showNameFields =
    (isGoogleUser && user?.isNewUser) || !user?.firstName?.trim() || !user?.lastName?.trim();
  const showPasswordField = isGoogleUser && (user?.isNewUser || !user?.hasPassword);
  const showBioField = user?.isNewUser || !user?.bio?.trim();
  const showAvatarField = user?.isNewUser || !user?.avatar_url?.trim();

  /* ─── Form state ─── */
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(null);
  
  // Pre-fill avatar preview with existing URL, or a DiceBear fallback for Google users without a photo
  const getInitialAvatar = () => {
    if (user?.avatar_url) return user.avatar_url;
    // Only use DiceBear initials for Google users
    if (isGoogleUser || user?.googleId || user?.isGoogleUser) {
      const seed = encodeURIComponent(`${firstName || user?.firstName || ""} ${lastName || user?.lastName || ""}`.trim() || user?.name || "User");
      return `https://api.dicebear.com/8.x/initials/svg?seed=${seed}`;
    }
    return null;
  };

  const [avatarPreview, setAvatarPreview] = useState(getInitialAvatar());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  /* ─── Sync form state with user data ─── */
  useEffect(() => {
    if (user) {
      if (user.firstName && !firstName) setFirstName(user.firstName);
      if (user.lastName && !lastName) setLastName(user.lastName);
      if (user.bio && !bio) setBio(user.bio);
      
      // Update preview if user photo becomes available (and user hasn't uploaded one manually)
      if (user.avatar_url && !avatar) {
        setAvatarPreview(user.avatar_url);
      }
    }
  }, [user, avatar]);

  /* ─── Password requirements (Google users only) ─── */
  const passwordRequirements = {
    length: password.length >= 8,
    capital: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  /* ─── Avatar selection handler ─── */
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, avatar: "Only JPEG, PNG, WebP, and GIF images are allowed" }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, avatar: "Image must be under 5MB" }));
      return;
    }

    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, avatar: null }));
  };

  /* ─── Form validation ─── */
  const validate = () => {
    const newErrors = {};

    if (showNameFields) {
      if (!firstName.trim()) newErrors.firstName = "First name is required";
      if (!lastName.trim()) newErrors.lastName = "Last name is required";
    }

    if (showPasswordField) {
      if (!password) {
        newErrors.password = "Password is required";
      } else if (!isPasswordValid) {
        newErrors.password = "Please meet all password requirements";
      }
    }

    if (showBioField && !bio.trim()) {
      newErrors.bio = "Bio is required";
    }

    if (showAvatarField && !avatar && !avatarPreview) {
      newErrors.avatar = "Profile photo is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ─── Form submission ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Dynamically include names + password if they were shown
      if (showNameFields) {
        formData.append("firstName", firstName.trim());
        formData.append("lastName", lastName.trim());
      }
      if (showPasswordField) {
        formData.append("password", password);
      }

      if (showBioField) {
        formData.append("bio", bio.trim());
      }

      if (showAvatarField && avatar) {
        formData.append("avatar", avatar);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/complete-profile`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to complete profile");
      }

      // Update auth context with the new user data (preserves token)
      updateUser({
        ...data,
        isProfileComplete: true,
        token: token,
      });

      toast.success("Profile completed successfully! 🎉");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Complete Your Profile"
      subtitle={
        isGoogleUser
          ? "Set up your account details to get started."
          : "Add a few more details to personalize your experience."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* ─── Dynamic Field: Profile Picture ─── */}
        {showAvatarField && (
          <div className="flex flex-col items-center mb-2">
          <label
            htmlFor="avatar-upload"
            className="relative cursor-pointer group"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-100 dark:bg-slate-800 transition-all group-hover:border-[#00BEA5] group-hover:shadow-lg group-hover:shadow-teal-500/20">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Only use DiceBear fallback for Google users
                    if (isGoogleUser || user?.googleId || user?.isGoogleUser) {
                      const seed = encodeURIComponent(`${firstName || user?.firstName || ""} ${lastName || user?.lastName || ""}`.trim() || user?.name || "User");
                      e.target.src = `https://api.dicebear.com/8.x/initials/svg?seed=${seed}`;
                    } else {
                      // For email users, clear the broken preview so the generic icon shows
                      setAvatarPreview(null);
                    }
                  }}
                />
              ) : (
                <UserIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              )}
            </div>
            {/* Camera overlay */}
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gradient-to-r from-[#2186df] to-[#02ffbb] flex items-center justify-center shadow-md border-2 border-white dark:border-[#0f172a] group-hover:scale-110 transition-transform">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">
            Click to upload photo
          </p>
          {errors.avatar && (
            <p className="text-[10px] text-red-500 mt-0.5">{errors.avatar}</p>
          )}
        </div>
      )}

        {/* ─── Dynamic Field: First & Last Name ─── */}
        {showNameFields && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <FormInput
                label="First Name"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setErrors((prev) => ({ ...prev, firstName: null }));
                }}
              />
              {errors.firstName && (
                <p className="text-[10px] text-red-500 -mt-2 mb-2">{errors.firstName}</p>
              )}
            </div>
            <div>
              <FormInput
                label="Last Name"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setErrors((prev) => ({ ...prev, lastName: null }));
                }}
              />
              {errors.lastName && (
                <p className="text-[10px] text-red-500 -mt-2 mb-2">{errors.lastName}</p>
              )}
            </div>
          </div>
        )}

        {/* ─── Dynamic Field: Password ─── */}
        {showPasswordField && (
          <div className="mb-3 relative">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Create a Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BEA5] focus:border-transparent transition-all dark:bg-[#0f172a] dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: null }));
                }}
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password checklist */}
            <div className="mt-2 grid grid-cols-2 gap-1">
              <ValidationItem label="8+ Characters" met={passwordRequirements.length} />
              <ValidationItem label="Uppercase" met={passwordRequirements.capital} />
              <ValidationItem label="Lowercase" met={passwordRequirements.lower} />
              <ValidationItem label="Number" met={passwordRequirements.number} />
              <ValidationItem label="Symbol" met={passwordRequirements.symbol} />
            </div>
            {errors.password && (
              <p className="text-[10px] text-red-500 mt-1">{errors.password}</p>
            )}
          </div>
        )}

        {/* ─── Dynamic Field: Bio ─── */}
        {showBioField && (
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Tell us about yourself
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BEA5] focus:border-transparent transition-all resize-none dark:bg-[#0f172a] dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
              placeholder="I'm a student passionate about AI and machine learning..."
              rows={3}
              maxLength={500}
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                setErrors((prev) => ({ ...prev, bio: null }));
              }}
              required
            />
            <div className="flex justify-between mt-0.5">
              {errors.bio ? (
                <p className="text-[10px] text-red-500">{errors.bio}</p>
              ) : (
                <span />
              )}
              <span className="text-[10px] text-gray-400">{bio.length}/500</span>
            </div>
          </div>
        )}

        {/* ─── Submit button ─── */}
        <button
          type="submit"
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#2186df] to-[#02ffbb] text-white font-bold text-base shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={loading || (showPasswordField && !isPasswordValid)}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : (
            "Complete Profile"
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default CompleteProfilePage;
