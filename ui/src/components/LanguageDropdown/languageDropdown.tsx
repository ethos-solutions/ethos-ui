import { AutoComplete } from '@ethos-frontend/ui';
import { getLanguageOptions } from '@ethos-frontend/constants';
import i18n from '@ethos-frontend/i18n';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageDropdown = () => {
  const { t } = useTranslation();
  const languageOptions = getLanguageOptions();
  const [selectedLang, setSelectedLang] = useState(
    () => localStorage.getItem('i18nextLng') || i18n.language,
  );

  useEffect(() => {
    i18n.changeLanguage(selectedLang);
  }, [selectedLang]);

  const handleChange = (
    _: unknown,
    option: { value: string } | null,
  ) => {
    const value = option?.value || '';
    setSelectedLang(value);
    localStorage.setItem('i18nextLng', value);
    i18n.changeLanguage(value);
  };

  const valueOption =
    languageOptions.find((opt) => opt.value === selectedLang) || null;

  return (
    <AutoComplete
      size="small"
      options={languageOptions}
      label={t('selectLanguage')}
      value={valueOption}
      onChange={handleChange}
    />
  );
};
