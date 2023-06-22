import type { BaseSyntheticEvent } from "react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { ErrorCode } from "@calcom/features/auth/lib/ErrorCode";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Dialog, DialogContent, Form } from "@calcom/ui";

import TwoFactor from "@components/auth/TwoFactor";

import TwoFactorAuthAPI from "./TwoFactorAuthAPI";
import TwoFactorModalHeader from "./TwoFactorModalHeader";

interface EnableTwoFactorModalProps {
  onCancel: () => void;
  onEnable: () => void;
}

enum SetupStep {
  ConfirmPassword,
  DisplayQrCode,
  EnterTotpCode,
}

const WithStep = ({
  step,
  current,
  children,
}: {
  step: SetupStep;
  current: SetupStep;
  children: JSX.Element;
}) => {
  return step === current ? children : null;
};

interface EnableTwoFactorValues {
  totpCode: string;
}

const EnableTwoFactorModal = ({ onEnable, onCancel }: EnableTwoFactorModalProps) => {
  const { t } = useLocale();
  const form = useForm<EnableTwoFactorValues>();

  const setupDescriptions = {
    [SetupStep.ConfirmPassword]: t("2fa_confirm_current_password"),
    [SetupStep.DisplayQrCode]: t("2fa_scan_image_or_use_code"),
    [SetupStep.EnterTotpCode]: t("2fa_enter_six_digit_code"),
  };
  const [step, setStep] = useState(SetupStep.ConfirmPassword);
  const [password, setPassword] = useState("");
  const [dataUri, setDataUri] = useState("");
  const [secret, setSecret] = useState("");

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();

    if (password.length === 0) {
      return;
    }

    try {
      const response = await TwoFactorAuthAPI.setup(password);
      const body = await response.json();

      if (response.status === 200) {
        setDataUri(body.dataUri);
        setSecret(body.secret);
        setStep(SetupStep.DisplayQrCode);
      } else {
        if (body.error === ErrorCode.IncorrectPassword) {
          // Handle incorrect password error
        } else {
          // Handle other error scenarios
        }
      }
    } catch (e) {
      // Handle error during setup
    }
  }

  async function handleEnable({ totpCode }: EnableTwoFactorValues, e: BaseSyntheticEvent | undefined) {
    if (totpCode.length === 6) {
      try {
        const response = await TwoFactorAuthAPI.enable(totpCode);
        const body = await response.json();

        if (response.status === 200) {
          onEnable();
        } else {
          if (body.error === ErrorCode.IncorrectTwoFactorCode) {
            // Handle incorrect two-factor code error
          } else {
            // Handle other error scenarios
          }
        }
      } catch (e) {
        // Handle error during enabling two-factor authentication
      }
    }
  }

  return (
    <Dialog open={true}>
      <DialogContent>
        <TwoFactorModalHeader title={t("enable_2fa")} description={setupDescriptions[step]} />

        <WithStep step={SetupStep.ConfirmPassword} current={step}>
          <form onSubmit={handleSetup}>
            <div className="mb-4">
              <label htmlFor="password" className="text-default mt-4 block text-sm font-medium">
                {t("password")}
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  value={password}
                  onInput={(e) => setPassword(e.currentTarget.value)}
                  className="border-default block w-full rounded-sm text-sm"
                />
              </div>
            </div>
          </form>
        </WithStep>
        <WithStep step={SetupStep.DisplayQrCode} current={step}>
          <>
            <div className="flex justify-center">
              {
                // eslint-disable-next-line @next/next/no-img-element
                <img src={dataUri} alt="" />
              }
            </div>
            <p className="text-center font-mono text-xs">{secret}</p>
          </>
        </WithStep>
        <Form handleSubmit={handleEnable} form={form}>
          <WithStep step={SetupStep.EnterTotpCode} current={step}>
            <div className="mb-4">
              <TwoFactor center />
            </div>
          </WithStep>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EnableTwoFactorModal;
