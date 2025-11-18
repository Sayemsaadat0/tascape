"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useFormik } from "formik"
import * as yup from "yup"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface TextInputProps extends React.ComponentProps<typeof Input> {
    error?: string
}

const TextInput: React.FC<TextInputProps> = ({ error, ...props }) => (
    <div className="space-y-1">
        <Input
            {...props}
            aria-invalid={Boolean(error)}
            className="h-11  rounded-full "
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
)

const SignUpForm = () => {
    const [isLoading, setIsLoading] = useState(false)

    const { handleChange, values, touched, errors, handleSubmit, resetForm } = useFormik({
        initialValues: {
            name: "",
            email: "",
            password: "",
        },
        validationSchema: yup.object().shape({
            name: yup.string().required("This Field is Required"),
            email: yup.string().email("Enter a valid email").required("This Field is Required"),
            password: yup.string().min(6, "Minimum 6 characters").required("This Field is Required"),
        }),
        onSubmit: async (data) => {
            try {
                setIsLoading(true)
                console.log(data)
                toast.success(`Welcome aboard, ${data.name || "friend"}!`)
                resetForm()
            } catch {
                toast.error("Unable to sign up")
            } finally {
                setIsLoading(false)
            }
        },
    })

    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-3">
                <TextInput
                    id="name"
                    type="text"
                    name="name"
                    onChange={handleChange}
                    value={values.name}
                    error={Boolean(errors.name) && touched.name ? errors.name : undefined}
                    placeholder="Your name"
                />
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    onChange={handleChange}
                    value={values.email}
                    error={Boolean(errors.email) && touched.email ? errors.email : undefined}
                    placeholder="Your email"
                />
                <TextInput
                    id="password"
                    type="password"
                    name="password"
                    onChange={handleChange}
                    value={values.password}
                    error={Boolean(errors.password) && touched.password ? errors.password : undefined}
                    placeholder="Password"
                />
                <div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 cursor-pointer rounded-full bg-white text-black font-semibold"
                    >
                        {isLoading ? "Creating..." : "Create account"}
                    </Button>
                </div>
            </form>
        </div>
    )
}

const Page = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-t-gray px-4">
            <div className="w-full max-w-sm rounded-[32px] bg-t-black p-8 text-white shadow-[1px_-1px_0px_5px_rgba(0,0,0,0.1)] border-4 border-white">
                <div className="flex flex-col space-y-6">
                    <Link href="/" className="cursor-pointer w-fit mx-auto flex items-center gap-3">
                        <div>
                            <Image className="w-7 h-7" src="/logo/short-logo1.png" alt="logo" width={300} height={300} />
                        </div>
                        <p className="text-white text-xl -mx-3 ">tascape</p>
                    </Link>
                    <p className="text-2xl font-semibold text-center">Create your account</p>
                    <SignUpForm />
                    <div className="tex-center  w-full ">
                        <p className="text-center text-white/60">or</p>
                    </div>
                    <div className="space-y-2">
                        <div className="text-sm text-center text-white/60">
                            Already have an account?
                            <Link href="/sign-in" className="mx-1 font-semibold cursor-pointer text-orange-300">Sign in</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page