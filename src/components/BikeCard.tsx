import { Card, Tag } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { buildRoute } from '../constants/routes';

const { Meta } = Card;

interface BikeCardProps {
    id: number;
    name: string;
    price: string;
    location: string;
    condition: string;
    image: string;
    brand?: string;
    compact?: boolean;
}

const BikeCard = ({ id, name, price, location, condition, image, brand, compact = false }: BikeCardProps) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(buildRoute.bikeDetail(id));
    };

    return (
        <Card
            hoverable
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
            cover={
                <div style={{ position: 'relative', height: compact ? '180px' : '200px', overflow: 'hidden' }}>
                    <img
                        alt={name}
                        src={image}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <Tag
                        color={condition === 'Như mới' ? 'green' : 'blue'}
                        style={{ position: 'absolute', top: 10, right: 10, fontWeight: 600 }}
                    >
                        {condition}
                    </Tag>
                </div>
            }
        >
            <Meta
                title={<div style={{ fontSize: compact ? '15px' : '16px', marginBottom: '8px' }}>{name}</div>}
                description={
                    <div>
                        <div style={{ color: '#1890ff', fontSize: compact ? '16px' : '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                            {price}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', color: '#8c8c8c', gap: '8px', fontSize: '13px' }}>
                            {brand && <span>{brand}</span>}
                            {brand && <span>•</span>}
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                <EnvironmentOutlined style={{ marginRight: '4px' }} /> {location}
                            </span>
                        </div>
                    </div>
                }
            />
        </Card>
    );
};

export default BikeCard;
