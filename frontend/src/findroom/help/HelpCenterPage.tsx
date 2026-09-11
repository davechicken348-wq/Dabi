import { useNavigate } from 'react-router-dom';
import HelpCenter from '../../admin/HelpCenter';

export default function HelpCenterPage() {
  const navigate = useNavigate();

  return (
    <HelpCenter
      open={true}
      onClose={() => navigate('/findroom')}
    />
  );
}
