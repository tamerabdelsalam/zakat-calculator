import { CalculatorWizard } from "@/components/calculator/wizard/calculator-wizard";
import { WizardProvider } from "@/components/calculator/wizard/wizard-context";

export default function CalculatorPage() {
  return (
    <WizardProvider>
      <CalculatorWizard />
    </WizardProvider>
  );
}
