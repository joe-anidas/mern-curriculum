import { useForm } from "react-hook-form";

type LoginFormData = {
  email: string;
  password: string;
};

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = (data: LoginFormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="email"
        placeholder="Enter your email"
        {...register("email", { required: "Email required" })}
      />
      {errors.email && <p>{errors.email.message}</p>}

      <input
        type="password"
        placeholder="Enter your password"
        {...register("password", {
          required: "Password required",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Invalid email",
          },
        })}
      />

      {errors.password && <p>{errors.password.message}</p>}

      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;
