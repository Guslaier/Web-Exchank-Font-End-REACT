import React from "react";
import "./input_pass.css";
import { ReactSVG } from "react-svg";
import eyeIcon from "../../../assets/svg/pass-input/eye-icon.svg";
import eyeOffIcon from "../../../assets/svg/pass-input/eye-off-icon.svg";
interface InputPassProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: "password";
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: "modal-input";
  required?: boolean;
}
const InputPass: React.FC<InputPassProps> = ({ className, ...props }) => {
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="password-wrapper" style={{ position: "relative" }}>
      <input
        type={showPassword ? "text" : "password"} // 🚩 สลับ type ตรงนี้
        placeholder="password"
        value={props.value ?? password}
        onChange={(e) => {
          setPassword(e.target.value);
          props.onChange?.(e);
        }}
        className={`pass-input ${className}`} // ใช้ class เดิมที่คุณทำไว้
        required
      />
      <div 
      className="toggle-password-wrapper"
        onClick={() => setShowPassword(!showPassword)}
      
      >
        {/* คุณสามารถใช้ ReactSVG หรือ Emoji ง่ายๆ ก่อนได้ */}
        {showPassword ? <ReactSVG src={eyeIcon} className="toggle-password"/> :
         <ReactSVG src={eyeOffIcon} className="toggle-password"/>}
      </div>
    </div>
  );
};

export default InputPass;
