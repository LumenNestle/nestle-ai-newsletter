import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar',
}: SearchBarProps) {
  const theme = useTheme();

  return (
    <TextField
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon
                sx={{ fontSize: 20, color: theme.palette.error.main }}
              />
            </InputAdornment>
          ),
        },
      }}
      sx={{ minWidth: { xs: '100%', sm: 220 } }}
    />
  );
}