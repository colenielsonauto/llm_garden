"use client"

import { VariantProps } from "class-variance-authority"
import {
  DateField as AriaDateField,
  DateFieldProps as AriaDateFieldProps,
  DateInput as AriaDateInput,
  DateInputProps as AriaDateInputProps,
  DateSegment as AriaDateSegment,
  DateSegmentProps as AriaDateSegmentProps,
  DateValue as AriaDateValue,
  TimeField as AriaTimeField,
  TimeFieldProps as AriaTimeFieldProps,
  TimeValue as AriaTimeValue,
  ValidationResult as AriaValidationResult,
  composeRenderProps,
  Text,
} from "react-aria-components"

import { cn } from "@/lib/utils"

import { FieldError, fieldGroupVariants, Label } from "./field" // Use relative import

const DateField = AriaDateField

const TimeField = AriaTimeField

function DateSegment({ className, ...props }: AriaDateSegmentProps) {
  return (
    <AriaDateSegment
      className={composeRenderProps(className, (className) =>
        cn(
          "type-literal:px-0 inline rounded p-0.5 caret-transparent outline outline-0",
          /* Placeholder */
          "data-[placeholder]:text-muted-foreground",
          /* Disabled */
          "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
          /* Focused */
          "data-[focused]:bg-accent data-[focused]:text-accent-foreground",
          /* Invalid */
          "data-[invalid]:data-[focused]:bg-destructive data-[invalid]:data-[focused]:data-[placeholder]:text-destructive-foreground data-[invalid]:data-[focused]:text-destructive-foreground data-[invalid]:data-[placeholder]:text-destructive data-[invalid]:text-destructive",
          className
        )
      )}
      {...props}
    />
  )
}

interface DateInputProps
  extends AriaDateInputProps,
    VariantProps<typeof fieldGroupVariants> {}

function DateInput({ // Rename local function to avoid conflict with import if needed
  className,
  variant,
  ...props
}: Omit<DateInputProps, "children">) {
  return (
    <AriaDateInput
      className={composeRenderProps(className, (className) =>
        cn(fieldGroupVariants({ variant }), "text-sm", className)
      )}
      {...props}
    >
      {(segment) => <DateSegment segment={segment} />}
    </AriaDateInput>
  )
}

interface JollyDateFieldProps<T extends AriaDateValue>
  extends AriaDateFieldProps<T> {
  label?: string
  description?: string
  errorMessage?: string | ((validation: AriaValidationResult) => string)
}

// Rename exported component to avoid conflict with internal AriaDateField
function JollyDateField<T extends AriaDateValue>({ 
  label,
  description,
  className,
  errorMessage,
  ...props
}: JollyDateFieldProps<T>) {
  return (
    <AriaDateField // Use the imported AriaDateField here
      className={composeRenderProps(className, (className) =>
        cn("group flex flex-col gap-2", className)
      )}
      {...props}
    >
      <Label>{label}</Label>
      {/* Ensure DateInput used here refers to the custom one defined above */}
      <DateInput /> 
      {description && (
        <Text className="text-sm text-muted-foreground" slot="description">
          {description}
        </Text>
      )}
      <FieldError>{errorMessage}</FieldError>
    </AriaDateField>
  )
}

interface JollyTimeFieldProps<T extends AriaTimeValue>
  extends AriaTimeFieldProps<T> {
  label?: string
  description?: string
  errorMessage?: string | ((validation: AriaValidationResult) => string)
}

// Rename exported component
function JollyTimeField<T extends AriaTimeValue>({ 
  label,
  description,
  errorMessage,
  className,
  ...props
}: JollyTimeFieldProps<T>) {
  return (
    <AriaTimeField // Use imported AriaTimeField
      className={composeRenderProps(className, (className) =>
        cn("group flex flex-col gap-2", className)
      )}
      {...props}
    >
      <Label>{label}</Label>
      <DateInput />
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTimeField>
  )
}

export {
  // Export internal components if needed elsewhere, or just the composed ones
  DateField, // Exporting the renamed AriaDateField as DateField
  DateSegment,
  DateInput, // Exporting the custom DateInput wrapper
  TimeField, // Exporting the renamed AriaTimeField as TimeField
  JollyDateField, // Exporting the main composed DateField
  JollyTimeField, // Exporting the main composed TimeField
}
export type { DateInputProps, JollyDateFieldProps, JollyTimeFieldProps } 