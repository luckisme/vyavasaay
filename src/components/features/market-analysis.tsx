
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

// Hardcoded data based on the provided image
const priceAlerts = [
    {
        title: 'Target Price Reached',
        description: 'Tomato crossed ₹25/kg in Pune market',
        time: '2 hours ago',
        type: 'success' as 'success' | 'warning',
    },
    {
        title: 'Price Drop Alert',
        description: 'Onion prices down 8% in Nashik APMC',
        time: '5 hours ago',
        type: 'warning' as 'success' | 'warning',
    },
];

const marketCategories = [
    {
        name: 'Cereals',
        commodities: '12 commodities',
        status: 'Stable',
        statusColor: 'bg-green-100 text-green-800',
        icon: (props: React.SVGProps<SVGSVGElement>) => (
            <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22h20"/><path d="M12 2v20"/><path d="M20 12H4"/><path d="M16 4l-4 4-4-4"/><path d="M16 20l-4-4-4 4"/></svg>
        ),
        iconBgColor: 'bg-yellow-100'
    },
    {
        name: 'Vegetables',
        commodities: '25 commodities',
        status: 'Rising',
        statusColor: 'bg-orange-100 text-orange-800',
        icon: (props: React.SVGProps<SVGSVGElement>) => (
            <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 20A8 8 0 0 0 16 4a8 8 0 0 0-8 16z"/><path d="M16 4A8 8 0 0 0 8 20"/><path d="M3 17.2A8 8 0 0 1 12 4a8 8 0 0 1 9 13.2"/><path d="M16.5 20a6 6 0 0 1-9 0"/></svg>
        ),
        iconBgColor: 'bg-green-100'
    },
    {
        name: 'Fruits',
        commodities: '18 commodities',
        status: 'Seasonal',
        statusColor: 'bg-blue-100 text-blue-800',
        icon: (props: React.SVGProps<SVGSVGElement>) => (
            <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M17 16c-3.31 0-6-2.69-6-6 0-1.01.25-1.94.68-2.75A5.993 5.993 0 0 1 17 10c3.31 0 6 2.69 6 6s-2.69 6-6 6z"/><path d="M7 14c-1.66 0-3-1.34-3-3s1.34-3 3-3c.35 0 .68.06 1 .17"/></svg>
        ),
        iconBgColor: 'bg-red-100'
    },
    {
        name: 'Spices',
        commodities: '8 commodities',
        status: 'Volatile',
        statusColor: 'bg-red-100 text-red-800',
        icon: (props: React.SVGProps<SVGSVGElement>) => (
            <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l-4.5 4.5L12 11l4.5-4.5L12 2z"/><path d="M12 11v11"/><path d="M12 2l4.5 4.5L12 11l-4.5-4.5L12 2z" transform="rotate(180 12 12)"/></svg>
        ),
        iconBgColor: 'bg-emerald-100'
    },
];

const AlertIcon = ({ type }: { type: 'success' | 'warning' }) => {
    if (type === 'success') {
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
    return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
};


export default function MarketAnalysis() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Price Alerts Section */}
      <div className="space-y-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Bell className="text-primary" />
          Price Alerts
        </h1>
        {priceAlerts.map((alert, index) => (
          <Card key={index} className={cn(
            "border-l-4 shadow-md",
            alert.type === 'success' ? 'border-green-500' : 'border-orange-500'
          )}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-card-foreground">{alert.title}</p>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
                <p className="text-xs text-muted-foreground">{alert.time}</p>
              </div>
              <AlertIcon type={alert.type} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market Categories Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M6 21v-5"/><path d="M18 21v-5"/><path d="M6 16h12V4H6v12z"/><path d="M10 4v4"/><path d="M14 4v4"/></svg>
            Market Categories
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {marketCategories.map((category, index) => (
            <Card key={index} className="shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 space-y-3 flex flex-col items-start">
                <div className={cn("p-2 rounded-lg", category.iconBgColor)}>
                  <category.icon className="h-6 w-6 text-foreground" />
                </div>
                <div className="space-y-1">
                    <p className="font-bold text-card-foreground">{category.name}</p>
                    <p className="text-xs text-muted-foreground">{category.commodities}</p>
                    <Badge className={cn("text-xs font-semibold mt-2", category.statusColor)}>
                      {category.status}
                    </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
