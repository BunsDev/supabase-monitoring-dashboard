import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Server,
  ShieldAlert
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

// Configuration object to replace environment variables
const CONFIG = {
  SUPABASE_PROJECT_REF: process.env.REACT_APP_SUPABASE_PROJECT_REF,
  SUPABASE_API_KEY: process.env.REACT_APP_SUPABASE_API_KEY
};

// Utility function to simulate Supabase project status check
const checkSupabaseProjectStatus = async (projectRef) => {
  try {
    // Simulated response for development
    return {
      status: 'active',
      pausePrediction: false,
      activeUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      usagePercentage: 45
    };

    // Uncomment and modify for actual API call when ready
    /*
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CONFIG.SUPABASE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch project status');
    }

    return await response.json();
    */
  } catch (error) {
    console.error('Supabase status check error:', error);
    return {
      status: 'error',
      pausePrediction: true,
      activeUntil: null,
      usagePercentage: 0
    };
  }
};

const SupabaseServiceCard = ({ projectRef }) => {
  const [projectStatus, setProjectStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectStatus = async () => {
      setLoading(true);
      try {
        const status = await checkSupabaseProjectStatus(projectRef);
        setProjectStatus(status);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch project status', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately and then every 5 minutes
    fetchProjectStatus();
    const intervalId = setInterval(fetchProjectStatus, 5 * 60 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [projectRef]);

  const getStatusIcon = () => {
    switch(projectStatus?.status) {
      case 'active': 
        return <CheckCircle color="green" />;
      case 'pausing': 
        return <AlertTriangle color="orange" />;
      case 'paused':
        return <ShieldAlert color="red" />;
      default: 
        return <Clock color="gray" />;
    }
  };

  if (loading) {
    return (
      <Card className="w-full mb-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database /> Supabase Project Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading project status...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full mb-4 border-red-500">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-red-500">
            <ShieldAlert /> Status Fetch Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Unable to retrieve project status. Please check your configuration.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Database /> Supabase Project Status
        </CardTitle>
        {getStatusIcon()}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm">
            <strong>Current Status:</strong> {projectStatus.status}
          </div>
          
          {projectStatus.pausePrediction && (
            <div className="text-sm text-orange-600 flex items-center">
              <AlertTriangle className="mr-2" size={16} />
              Project may be paused soon
            </div>
          )}
          
          {projectStatus.activeUntil && (
            <div className="text-sm">
              <strong>Active Until:</strong> {projectStatus.activeUntil.toLocaleString()}
            </div>
          )}
          
          <div className="text-sm">
            <strong>Usage:</strong> {projectStatus.usagePercentage}%
          </div>

          <ResponsiveContainer width="100%" height={100}>
            <LineChart 
              data={[
                { name: 'Current', usage: projectStatus.usagePercentage },
                { name: 'Threshold', usage: 80 } // Pause threshold
              ]}
            >
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="usage" 
                stroke={projectStatus.usagePercentage > 80 ? "red" : "green"}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const ServiceMonitoringDashboard = () => {
  // Use configuration object instead of environment variables
  const SUPABASE_PROJECT_REF = CONFIG.SUPABASE_PROJECT_REF;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Server /> Backend Services Monitoring
      </h1>
      {SUPABASE_PROJECT_REF ? (
        <SupabaseServiceCard projectRef={SUPABASE_PROJECT_REF} />
      ) : (
        <Card className="w-full mb-4 border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle /> Configuration Missing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please set SUPABASE_PROJECT_REF in the configuration</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServiceMonitoringDashboard;