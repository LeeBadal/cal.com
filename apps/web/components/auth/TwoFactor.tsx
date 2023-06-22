import React, { useEffect, useState } from "react";
import useDigitInput from "react-digit-input";
import { useFormContext } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Label, Input } from "@calcom/ui";

export default function TwoFactor({ center = true }) {
  const [value, setValue] = useState("");
  const { t } = useLocale();
  const methods = useFormContext();

  const digits = useDigitInput({
    acceptedCharacters: /^[0-9]$/,
    length: 6,
    value,
    onChange: setValue,
  });

  useEffect(() => {
    if (value) methods.setValue("totpCode", value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const className = "h-12 w-12 !text-xl text-center";

  const handleSubmit = () => {
    // Auto-submit the form after the user has entered the 2FA code
    methods.trigger(); // This will trigger form validation
    if (methods.formState.isValid) {
      // If the form is valid, you can submit it programmatically
      methods.handleSubmit((data) => {
        console.log(data); // Access the form data here
        // Add your logic to submit the form to the server
      })();
    }
  };

  return (
    <div className={center ? "mx-auto !mt-0 max-w-sm" : "!mt-0 max-w-sm"}>
      <Label className="mt-4">{t("2fa_code")}</Label>

      <p className="text-subtle mb-4 text-sm">{t("2fa_enabled_instructions")}</p>

      <input type="hidden" value={value} {...methods.register("totpCode")} />

      <div className="flex flex-row justify-between">
        {digits.map((digit, index) => (
          <Input
            key={`2fa${index}`}
            className={className}
            name={`2fa${index + 1}`}
            inputMode="decimal"
            {...digit}
            autoFocus={index === 0}
            autoComplete="one-time-code"
            onChange={handleSubmit} // Call handleSubmit on each digit input change
          />
        ))}
      </div>
    </div>
  );
}
