const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

// Update initial state
const initialTaxPayerStr = `  const [taxPayerConfig, setTaxPayerConfig] = useState({
    enabled: state.settings?.inactivityTax?.enabled || false,
    durationType: state.settings?.inactivityTax?.durationType || "hours",
    hourlyAmount: state.settings?.inactivityTax?.hourlyAmount || 0,
    hoursThreshold: state.settings?.inactivityTax?.hoursThreshold || 1,
    dailyAmount: state.settings?.inactivityTax?.dailyAmount || 0,
    daysThreshold: state.settings?.inactivityTax?.daysThreshold || 1
  });`;

const newInitialTaxPayerStr = `  const [taxPayerConfig, setTaxPayerConfig] = useState({
    enabled: state.settings?.inactivityTax?.enabled || false,
    durationType: state.settings?.inactivityTax?.durationType || "hours",
    hourlyAmount: state.settings?.inactivityTax?.hourlyAmount || 0,
    hoursThreshold: state.settings?.inactivityTax?.hoursThreshold || 1,
    dailyAmount: state.settings?.inactivityTax?.dailyAmount || 0,
    daysThreshold: state.settings?.inactivityTax?.daysThreshold || 1,
    minuteAmount: state.settings?.inactivityTax?.minuteAmount || 0,
    minutesThreshold: state.settings?.inactivityTax?.minutesThreshold || 1
  });`;

code = code.replace(initialTaxPayerStr, newInitialTaxPayerStr);

// Add useEffect
const useEffectMarketStr = `  useEffect(() => {
    if (state.settings?.marketTiming) {`;

const newUseEffectMarketStr = `  useEffect(() => {
    if (state.settings?.inactivityTax) {
      setTaxPayerConfig({
        enabled: state.settings.inactivityTax.enabled || false,
        durationType: state.settings.inactivityTax.durationType || "hours",
        hourlyAmount: state.settings.inactivityTax.hourlyAmount || 0,
        hoursThreshold: state.settings.inactivityTax.hoursThreshold || 1,
        dailyAmount: state.settings.inactivityTax.dailyAmount || 0,
        daysThreshold: state.settings.inactivityTax.daysThreshold || 1,
        minuteAmount: state.settings.inactivityTax.minuteAmount || 0,
        minutesThreshold: state.settings.inactivityTax.minutesThreshold || 1
      });
    }
  }, [state.settings?.inactivityTax]);

  useEffect(() => {
    if (state.settings?.marketTiming) {`;

code = code.replace(useEffectMarketStr, newUseEffectMarketStr);

// Change button text and add loading animation
const saveFuncStr = `  const handleSaveTaxPayer = () => {
    dispatch({
      type: "UPDATE_SETTINGS",
      payload: {
        ...state.settings,
        inactivityTax: taxPayerConfig
      }
    });
    alert("Tax payer configuration saved successfully!");
  };`;

const newSaveFuncStr = `  const [isSavingTax, setIsSavingTax] = useState(false);
  const handleSaveTaxPayer = async () => {
    setIsSavingTax(true);
    await dispatch({
      type: "UPDATE_SETTINGS",
      payload: {
        ...state.settings,
        inactivityTax: taxPayerConfig
      }
    });
    setTimeout(() => {
      setIsSavingTax(false);
    }, 500);
  };`;

code = code.replace(saveFuncStr, newSaveFuncStr);

fs.writeFileSync('src/pages/AdminPage.tsx', code);
