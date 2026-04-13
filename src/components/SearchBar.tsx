import { useState } from 'react';
import { Card, Input, Button } from 'antd';
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

interface SearchBarProps {
    onSearch?: (query: string, location: string) => void;
    showCard?: boolean;
}

const SearchBar = ({ onSearch, showCard = true }: SearchBarProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState('');
    const navigate = useNavigate();

    const handleSearch = () => {
        if (onSearch) {
            onSearch(searchQuery, location);
        } else {
            // Navigate to market with search params
            const params = new URLSearchParams();
            if (searchQuery) params.set('q', searchQuery);
            if (location) params.set('location', location);
            navigate(`${ROUTES.MARKET}?${params.toString()}`);
        }
    };

    const content = (
        <Input.Group compact size="large">
            <Input
                style={{ width: '50%', textAlign: 'left' }}
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Tìm kiếm xe đạp (thương hiệu, model...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onPressEnter={handleSearch}
            />
            <Input
                style={{ width: '30%', textAlign: 'left' }}
                prefix={<EnvironmentOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Địa điểm"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onPressEnter={handleSearch}
            />
            <Button
                type="primary"
                size="large"
                style={{ width: '20%' }}
                icon={<SearchOutlined />}
                onClick={handleSearch}
            >
                Tìm kiếm
            </Button>
        </Input.Group>
    );

    if (!showCard) {
        return content;
    }

    return (
        <Card
            bordered={false}
            style={{
                maxWidth: '900px',
                margin: '0 auto',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                padding: '10px'
            }}
        >
            {content}
        </Card>
    );
};

export default SearchBar;
