"use client";

import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

interface EventItem {
  type: string;
  severity: string;
  count: number;
}

interface SeriesItem {
  name: string;
  data: number[];
}

const EventSeverityChart: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [series, setSeries] = useState<SeriesItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/events/global");
      const data: EventItem[] = await response.json();

      const eventTypes = Array.from(new Set(data.map((item) => item.type)));
      const severities = ["Low", "Medium", "High", "Critical"];

      const builtSeries: SeriesItem[] = severities.map((severity) => ({
        name: severity,
        data: eventTypes.map((type) => {
          const found = data.find(
            (item) => item.type === type && item.severity === severity
          );
          return found ? found.count : 0;
        }),
      }));

      setCategories(eventTypes);
      setSeries(builtSeries);
    };

    fetchData();
  }, []);

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 400,
      stacked: false,
    },
    xaxis: {
      categories,
    },
    plotOptions: {
      bar: {
        columnWidth: "55%",
      },
    },
    legend: {
      position: "top",
    },
  };

  return (
    <div>
      <h2 className="text-xl mb-2">Event Severity by Event Type</h2>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={400}
      />
    </div>
  );
};

export default EventSeverityChart;
