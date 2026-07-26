import React, { useState } from "react";
import { RiEyeFill, RiEyeOffFill } from "react-icons/ri";

function InputField(props) {
  const { label, id, extra, type, placeholder, variant, state, disabled, value, onChange } =
    props;

  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";

  return (
    <div className={`${extra}`}>
      {label && (
        <label
          htmlFor={id}
          className={`text-sm text-navy-700 dark:text-white ${
            variant === "auth" ? "ml-1.5 font-medium" : "ml-3 font-bold"
          }`}
        >
          {label}
        </label>
      )}
      <div className="relative mt-2 flex items-center">
        <input
          disabled={disabled}
          type={isPasswordType ? (showPassword ? "text" : "password") : type}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`flex h-12 w-full items-center justify-center rounded-xl border bg-white/0 p-3 ${
            isPasswordType ? "pr-10" : ""
          } text-sm outline-none ${
            disabled === true
              ? "!border-none !bg-gray-100 dark:!bg-white/5 dark:placeholder:!text-[rgba(255,255,255,0.15)]"
              : state === "error"
              ? "border-red-500 text-red-500 placeholder:text-red-500 dark:!border-red-400 dark:!text-red-400 dark:placeholder:!text-red-400"
              : state === "success"
              ? "border-green-500 text-green-500 placeholder:text-green-500 dark:!border-green-400 dark:!text-green-400 dark:placeholder:!text-green-400"
              : "border-gray-200 dark:!border-white/10 dark:text-white"
          }`}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-3 flex items-center justify-center text-gray-500 hover:text-navy-700 dark:text-gray-400 dark:hover:text-white transition-colors focus:outline-none"
            title={showPassword ? "Şifreyi Gizle" : "Şifreyi Göster"}
          >
            {showPassword ? (
              <RiEyeOffFill className="h-5 w-5" />
            ) : (
              <RiEyeFill className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default InputField;
