"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { X, LifeBuoy, Loader2, ChevronDown } from "lucide-react";

/* ============================================================================
 * CONFIG
 * ==========================================================================*/

// Replace with your support team's WhatsApp number (international format, no + or spaces)


const BRANCH_OPTIONS = [
    "Main Branch",
    "Branch A",
    "Branch B",
    "Warehouse",
    "Other",
] as const;

const CATEGORY_OPTIONS = [
    "Login Issue",
    "POS Issue",
    "Exchange Rate",
    "Customer Balance",
    "Inventory",
    "Reports",
    "Printing",
    "Payment",
    "Technical Bug",
    "Other",
] as const;

const SCREENSHOT_COUNT_OPTIONS = ["0", "1", "2", "3", "4", "5+"] as const;

/* ============================================================================
 * VALIDATION SCHEMA
 * ==========================================================================*/

const phoneRegex = /^\+?[0-9]{7,15}$/;

const helpSupportSchema = z.object({
    businessName: z
        .string()
        .trim()
        .min(1, "Business name is required")
        .min(2, "Business name must be at least 2 characters"),
    branch: z.enum(BRANCH_OPTIONS, {
        error: "Please select a branch",
    }),
    username: z
        .string()
        .trim()
        .min(1, "Username is required")
        .min(2, "Username must be at least 2 characters"),
    phoneNumber: z
        .string()
        .trim()
        .min(1, "Phone number is required")
        .regex(phoneRegex, "Enter a valid phone number, e.g. +25261XXXXXXX"),
    category: z.enum(CATEGORY_OPTIONS, {
        error: "Please select a category",
    }),
    screenshot: z.any().optional(),

    problemDescription: z
        .string()
        .trim()
        .min(1, "Problem description is required")
        .min(15, "Please provide at least 15 characters of detail"),
    
});

type HelpSupportFormValues = z.infer<typeof helpSupportSchema>;

/* ============================================================================
 * AUTO-DETECTED SYSTEM INFO
 * ==========================================================================*/

interface SystemInfo {
    deviceType: "Desktop" | "Laptop" | "Mobile" | "Tablet";
    browserName: string;
    operatingSystem: string;
    screenResolution: string;
    currentDate: string;
    currentTime: string;
    timezone: string;
    language: string;
}

function detectSystemInfo(): SystemInfo {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
        return {
            deviceType: "Desktop",
            browserName: "Unknown",
            operatingSystem: "Unknown",
            screenResolution: "Unknown",
            currentDate: "",
            currentTime: "",
            timezone: "Unknown",
            language: "Unknown",
        };
    }

    const ua = navigator.userAgent;

    // Device type
    let deviceType: SystemInfo["deviceType"] = "Desktop";
    if (/iPad|Tablet/i.test(ua)) {
        deviceType = "Tablet";
    } else if (/Mobile|Android|iPhone/i.test(ua)) {
        deviceType = "Mobile";
    } else if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) {
        deviceType = "Tablet";
    } else if (/Win|Linux|Mac/i.test(ua)) {
        deviceType = window.screen.width < 1366 ? "Laptop" : "Desktop";
    }

    // Browser
    let browserName = "Unknown";
    if (ua.includes("Edg/")) browserName = "Microsoft Edge";
    else if (ua.includes("OPR/") || ua.includes("Opera")) browserName = "Opera";
    else if (ua.includes("Chrome/") && !ua.includes("Edg/")) browserName = "Chrome";
    else if (ua.includes("Firefox/")) browserName = "Firefox";
    else if (ua.includes("Safari/") && !ua.includes("Chrome/")) browserName = "Safari";

    // OS
    let operatingSystem = "Unknown";
    if (ua.includes("Windows NT 10.0")) operatingSystem = "Windows 10/11";
    else if (ua.includes("Windows")) operatingSystem = "Windows";
    else if (ua.includes("Mac OS X")) operatingSystem = "macOS";
    else if (ua.includes("Android")) operatingSystem = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) operatingSystem = "iOS";
    else if (ua.includes("Linux")) operatingSystem = "Linux";

    const now = new Date();

    return {
        deviceType,
        browserName,
        operatingSystem,
        screenResolution: `${window.screen.width} × ${window.screen.height}`,
        currentDate: now.toLocaleDateString("en-GB"),
        currentTime: now.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
        language: navigator.language || "Unknown",
    };
}

/* ============================================================================
 * WHATSAPP MESSAGE BUILDER
 * ==========================================================================*/

function buildWhatsAppMessage(
    data: HelpSupportFormValues,
    systemInfo: SystemInfo
): string {
    const divider = "━━━━━━━━━━━━━━━━━━━━━━━━━━";

    const lines = [
        divider,
        "NEW SUPPORT REQUEST",
        divider,
        "",
        "Business Name",
        data.businessName,
        "",
        "Branch",
        data.branch,
        "",
        "Username",
        data.username,
        "",
        "Phone Number",
        data.phoneNumber,
        "",
        "Category",
        data.category,
        "",
        "",
        "Problem Description",
        data.problemDescription,
        "",
        "Screenshots",
        `${data.screenshot?.length ?? 0} attached`,
        "",
        "Device",
        systemInfo.deviceType,
        "",
        "Browser",
        systemInfo.browserName,
        "",
        "Operating System",
        systemInfo.operatingSystem,
        "",
        "Screen Resolution",
        systemInfo.screenResolution,
        "",
        "Language",
        systemInfo.language,
        "",
        "Timezone",
        systemInfo.timezone,
        "",
        "Date",
        systemInfo.currentDate,
        "",
        "Time",
        systemInfo.currentTime,
        "",
        divider,
        "Generated Automatically",
        divider,
    ];

    return lines.join("\n");
}

/* ============================================================================
 * REUSABLE FIELD PRIMITIVES (styled to match the Customer Modal)
 * ==========================================================================*/

function FieldLabel({
    children,
    required,
    htmlFor,
}: {
    children: React.ReactNode;
    required?: boolean;
    htmlFor: string;
}) {
    return (
        <label
            htmlFor={htmlFor}
            className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
            {children}
            {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p
            role="alert"
            className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-500"
        >
            {message}
        </p>
    );
}

const inputBaseClasses =
    "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition-all duration-150 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800/60";

function getInputClasses(hasError: boolean) {
    return [
        inputBaseClasses,
        hasError
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100 dark:border-rose-500/70 dark:focus:ring-rose-500/10"
            : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 dark:border-slate-700 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/10",
    ].join(" ");
}

/* ============================================================================
 * MAIN COMPONENT
 * ==========================================================================*/

export interface HelpSupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HelpSupportModal({
    isOpen,
    onClose,
}: HelpSupportModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

    const dialogRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const previouslyFocusedElement = useRef<HTMLElement | null>(null);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<HelpSupportFormValues>({
        resolver: zodResolver(helpSupportSchema),
        defaultValues: {
            businessName: "",
            branch: undefined,
            username: "",
            phoneNumber: "",
            category: undefined,
            screenshot: undefined,
            problemDescription: "",
            
        },
    });

    // Mount guard for portal (avoids SSR document mismatch)
    useEffect(() => {
        setMounted(true);
    }, []);

    // Detect system info once when modal opens
    useEffect(() => {
        if (isOpen) {
            setSystemInfo(detectSystemInfo());
        }
    }, [isOpen]);

    // Body scroll lock
    useEffect(() => {
        if (!isOpen) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    // Focus management: store previous focus, focus close button on open, restore on close
    useEffect(() => {
        if (isOpen) {
            previouslyFocusedElement.current = document.activeElement as HTMLElement;
            const timer = setTimeout(() => {
                closeButtonRef.current?.focus();
            }, 0);
            return () => clearTimeout(timer);
        } else if (previouslyFocusedElement.current) {
            previouslyFocusedElement.current.focus();
            previouslyFocusedElement.current = null;
        }
    }, [isOpen]);

    // Reset the form whenever the modal closes (after exit animation completes is fine too)
    useEffect(() => {
        if (!isOpen) {
            reset();
        }
    }, [isOpen, reset]);

    const handleClose = useCallback(() => {
        if (isSubmitting) return;
        onClose();
    }, [isSubmitting, onClose]);

    // Escape key handling
    useEffect(() => {
        if (!isOpen) return;
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                e.preventDefault();
                handleClose();
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, handleClose]);

    // Focus trap
    useEffect(() => {
        if (!isOpen) return;

        function handleTabKey(e: KeyboardEvent) {
            if (e.key !== "Tab" || !dialogRef.current) return;

            const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
                'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }

        document.addEventListener("keydown", handleTabKey);
        return () => document.removeEventListener("keydown", handleTabKey);
    }, [isOpen]);

    const handleOverlayClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) {
                handleClose();
            }
        },
        [handleClose]
    );

    const onSubmit = async (data: HelpSupportFormValues) => {
        if (!systemInfo) {
            toast.error("System information is still being detected.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/help-support", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    systemInfo,
                }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message);
            }

            toast.success("Si guul leh ayaa loo diray. Waxaa kula soo xiriiri doona kooxda taageerada.");

            reset();

            onClose();
        } catch (error) {
            toast.error("Waxaa dhacay cilad, fadlan isku day mar kale.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const detectedInfoItems = useMemo(() => {
        if (!systemInfo) return [];
        return [
            { label: "Device Type", value: systemInfo.deviceType },
            { label: "Browser", value: systemInfo.browserName },
            { label: "Operating System", value: systemInfo.operatingSystem },
            { label: "Screen Resolution", value: systemInfo.screenResolution },
            { label: "Date", value: systemInfo.currentDate },
            { label: "Time", value: systemInfo.currentTime },
            { label: "Timezone", value: systemInfo.timezone },
            { label: "Language", value: systemInfo.language },
        ];
    }, [systemInfo]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                >
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        onMouseDown={handleOverlayClick}
                        aria-hidden="true"
                    />

                    {/* Dialog */}
                    <motion.div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="help-support-modal-title"
                        aria-describedby="help-support-modal-description"
                        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 8 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                    <LifeBuoy className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <div>
                                    <h2
                                        id="help-support-modal-title"
                                        className="text-lg font-semibold text-slate-900 dark:text-slate-50"
                                    >
                                        Help &amp; Support
                                    </h2>
                                    <p
                                        id="help-support-modal-description"
                                        className="mt-0.5 text-sm text-slate-500 dark:text-slate-400"
                                    >
                                        Need help? Submit your issue and our support team will
                                        contact you through WhatsApp.
                                    </p>
                                </div>
                            </div>

                            <button
                                ref={closeButtonRef}
                                type="button"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                aria-label="Close help and support form"
                                className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800 dark:hover:text-slate-200 dark:focus:ring-indigo-500/10"
                            >
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>

                        {/* Body (scrollable) */}
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate
                            className="flex min-h-0 flex-1 flex-col"
                        >
                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
                                    {/* Business Name */}
                                    <div>
                                        <FieldLabel htmlFor="businessName" required>
                                            Business Name
                                        </FieldLabel>
                                        <input
                                            id="businessName"
                                            type="text"
                                            placeholder="Enter business name"
                                            disabled={isSubmitting}
                                            aria-invalid={!!errors.businessName}
                                            aria-describedby={
                                                errors.businessName ? "businessName-error" : undefined
                                            }
                                            className={getInputClasses(!!errors.businessName)}
                                            {...register("businessName")}
                                        />
                                        <FieldError message={errors.businessName?.message} />
                                    </div>

                                    {/* Branch */}
                                    <div>
                                        <FieldLabel htmlFor="branch" required>
                                            Branch
                                        </FieldLabel>
                                        <div className="relative">
                                            <select
                                                id="branch"
                                                disabled={isSubmitting}
                                                defaultValue=""
                                                aria-invalid={!!errors.branch}
                                                aria-describedby={errors.branch ? "branch-error" : undefined}
                                                className={`${getInputClasses(
                                                    !!errors.branch
                                                )} appearance-none pr-9`}
                                                {...register("branch")}
                                            >
                                                <option value="" disabled>
                                                    Select branch
                                                </option>
                                                {BRANCH_OPTIONS.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown
                                                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <FieldError message={errors.branch?.message} />
                                    </div>

                                    {/* Username */}
                                    <div>
                                        <FieldLabel htmlFor="username" required>
                                            Username
                                        </FieldLabel>
                                        <input
                                            id="username"
                                            type="text"
                                            placeholder="Enter username"
                                            disabled={isSubmitting}
                                            aria-invalid={!!errors.username}
                                            aria-describedby={
                                                errors.username ? "username-error" : undefined
                                            }
                                            className={getInputClasses(!!errors.username)}
                                            {...register("username")}
                                        />
                                        <FieldError message={errors.username?.message} />
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <FieldLabel htmlFor="phoneNumber" required>
                                            Phone Number
                                        </FieldLabel>
                                        <input
                                            id="phoneNumber"
                                            type="tel"
                                            inputMode="tel"
                                            placeholder="+25261XXXXXXX"
                                            disabled={isSubmitting}
                                            aria-invalid={!!errors.phoneNumber}
                                            aria-describedby={
                                                errors.phoneNumber ? "phoneNumber-error" : undefined
                                            }
                                            className={getInputClasses(!!errors.phoneNumber)}
                                            {...register("phoneNumber")}
                                        />
                                        <FieldError message={errors.phoneNumber?.message} />
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <FieldLabel htmlFor="category" required>
                                            Category
                                        </FieldLabel>
                                        <div className="relative">
                                            <select
                                                id="category"
                                                disabled={isSubmitting}
                                                defaultValue=""
                                                aria-invalid={!!errors.category}
                                                aria-describedby={
                                                    errors.category ? "category-error" : undefined
                                                }
                                                className={`${getInputClasses(
                                                    !!errors.category
                                                )} appearance-none pr-9`}
                                                {...register("category")}
                                            >
                                                <option value="" disabled>
                                                    Select category
                                                </option>
                                                {CATEGORY_OPTIONS.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown
                                                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <FieldError message={errors.category?.message} />
                                    </div>

                                
                                    {/* Problem Title - full width */}
                                    <div className="sm:col-span-2">
                                        <FieldLabel htmlFor="screenshot" required>
                                            Upload Screenshot
                                        </FieldLabel>
                                        <input
                                            id="screenshot"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            disabled={isSubmitting}
                                            className={getInputClasses(!!errors.screenshot)}
                                            {...register("screenshot")}
                                        />
                                        {/* <FieldError message={errors.screenshot?.message} /> */}
                                    </div>

                                    {/* Problem Description - full width */}
                                    <div className="sm:col-span-2">
                                        <FieldLabel htmlFor="problemDescription" required>
                                            Problem Description
                                        </FieldLabel>
                                        <textarea
                                            id="problemDescription"
                                            placeholder="Describe the issue in detail..."
                                            disabled={isSubmitting}
                                            aria-invalid={!!errors.problemDescription}
                                            aria-describedby={
                                                errors.problemDescription
                                                    ? "problemDescription-error"
                                                    : undefined
                                            }
                                            style={{ minHeight: "180px" }}
                                            className={`${getInputClasses(
                                                !!errors.problemDescription
                                            )} resize-y`}
                                            {...register("problemDescription")}
                                        />
                                        <FieldError message={errors.problemDescription?.message} />
                                    </div>
                                </div>

                                {/* Auto-detected information */}
                                <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                                    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                        Auto-Detected Information
                                    </h3>
                                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                                        Collected automatically and included with your request.
                                    </p>

                                    {systemInfo ? (
                                        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-4">
                                            {detectedInfoItems.map((item) => (
                                                <div key={item.label} className="min-w-0">
                                                    <dt className="truncate text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                                        {item.label}
                                                    </dt>
                                                    <dd className="mt-0.5 truncate text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                        {item.value || "—"}
                                                    </dd>
                                                </div>
                                            ))}
                                        </dl>
                                    ) : (
                                        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                                            Detecting device information…
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                    className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors duration-150 hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-indigo-500/20"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2
                                                className="h-4 w-4 animate-spin text-emerald-400"
                                                aria-hidden="true"
                                            />
                                            Sending…
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="h-4 w-4"
                                                fill="currentColor"
                                                aria-hidden="true"
                                            >
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                                <path d="M12.004 2c-5.514 0-9.987 4.474-9.987 9.987 0 1.762.462 3.482 1.34 4.997L2 22l5.142-1.34a9.96 9.96 0 0 0 4.862 1.24h.004c5.514 0 9.987-4.473 9.987-9.987C21.995 6.474 17.522 2 12.004 2zm0 18.124h-.003a8.13 8.13 0 0 1-4.142-1.135l-.297-.176-3.075.802.82-3-.193-.308a8.124 8.124 0 0 1-1.246-4.32c0-4.495 3.658-8.153 8.14-8.153 2.175 0 4.218.848 5.756 2.388a8.085 8.085 0 0 1 2.385 5.768c-.001 4.495-3.659 8.134-8.145 8.134z" />
                                            </svg>
                                            Send message
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}