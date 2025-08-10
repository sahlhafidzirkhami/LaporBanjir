import axios from "axios";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Text as SvgText } from "react-native-svg";

// --- KONFIGURASI API ---
const BENCANA_ALAM_API_URL =
  "https://opendata.bandung.go.id/api/bigdata/dinas_pemadam_kebakaran_dan_penyelamatan/jumlah_kejadian_bencana_alam_di_kota_bandung";
const BENCANA_LAINNYA_API_URL =
  "https://opendata.bandung.go.id/api/bigdata/dinas_pemadam_kebakaran_dan_penyelamatan/jumlah_kejadian_bencana_lainnya_di_kota_bandung";
const chartWidth = Dimensions.get("window").width * 2;

// --- TIPE DATA ---
interface BencanaBulanan {
  id: number;
  kategori_bencana_alam: string;
  bulan: string;
  tahun: number;
  jumlah: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color: (opacity?: number) => string;
    strokeWidth?: number;
  }[];
  legend: string[];
}

interface BencanaLainnya {
  kategori_bencana_lainnya: string;
  jumlah_bencana: number;
}

// Tipe data baru yang mencakup semua kategori
interface RingkasanDataLengkap {
  total: number;
  sar: number;
  pohonTumbang: number;
  longsor: number;
  banjir: number;
  trafficAccident: number;
  buildingCollapse: number;
  animalRescue: number;
  lainLain: number;
}

export default function HistoryScreen() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [ringkasanData, setRingkasanData] =
    useState<RingkasanDataLengkap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const uniqueKeyCounter = useRef(0);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setIsLoading(true);
        uniqueKeyCounter.current = 0;
        try {
          const [resBencanaAlam, resBencanaLainnya] = await Promise.all([
            axios.get(BENCANA_ALAM_API_URL),
            axios.get(BENCANA_LAINNYA_API_URL),
          ]);

          processDataForChart(resBencanaAlam.data.data);
          processDataForSummary(resBencanaLainnya.data.data);
        } catch (error) {
          console.error("Gagal mengambil data histori:", error);
        } finally {
          setIsLoading(false);
        }
      };

      const processDataForChart = (allData: BencanaBulanan[]) => {
        const categories = ["BANJIR", "POHON TUMBANG", "LONGSOR"];
        const monthOrder = [
          "JANUARI",
          "FEBRUARI",
          "MARET",
          "APRIL",
          "MEI",
          "JUNI",
          "JULI",
          "AGUSTUS",
          "SEPTEMBER",
          "OKTOBER",
          "NOVEMBER",
          "DESEMBER",
        ];
        const datasets = categories.map((category, index) => {
          const dataPoints = monthOrder.map((month) => {
            const entry = allData.find(
              (d) => d.bulan === month && d.kategori_bencana_alam === category
            );
            return entry ? entry.jumlah : 0;
          });
          const colors = [
            (opacity = 1) => `rgba(220, 53, 69, ${opacity})`,
            (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
            (opacity = 1) => `rgba(40, 167, 69, ${opacity})`,
          ];
          return { data: dataPoints, color: colors[index], strokeWidth: 2 };
        });
        setChartData({
          labels: monthOrder.map((m) => m.substring(0, 3)),
          datasets: datasets,
          legend: ["Banjir", "Pohon Tumbang", "Longsor"],
        });
      };

      const processDataForSummary = (dataLainnya: BencanaLainnya[]) => {
        const summary: RingkasanDataLengkap = {
          total: 0,
          sar: 0,
          pohonTumbang: 0,
          longsor: 0,
          banjir: 0,
          trafficAccident: 0,
          buildingCollapse: 0,
          animalRescue: 0,
          lainLain: 0,
        };

        dataLainnya.forEach((item) => {
          const jumlah = item.jumlah_bencana || 0;
          summary.total += jumlah;
          switch (item.kategori_bencana_lainnya) {
            case "SEARCH AND RESCUE":
              summary.sar += jumlah;
              break;
            case "POHON TUMBANG":
              summary.pohonTumbang += jumlah;
              break;
            case "LONGSOR":
              summary.longsor += jumlah;
              break;
            case "BANJIR":
              summary.banjir += jumlah;
              break;
            case "TRAFIC ACCIDENT":
              summary.trafficAccident += jumlah;
              break;
            case "BUILDING COLLAPS":
              summary.buildingCollapse += jumlah;
              break;
            case "ANIMAL RESCUE":
              summary.animalRescue += jumlah;
              break;
            case "LAIN-LAIN":
              summary.lainLain += jumlah;
              break;
          }
        });
        setRingkasanData(summary);
      };

      fetchData();
    }, [])
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const dataForChart = chartData ? { ...chartData } : null;
  if (dataForChart) {
    delete (dataForChart as Partial<ChartData>).legend;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Grafik Komparasi Bencana Alam</Text>

      {chartData && dataForChart ? (
        <View style={styles.chartWrapper}>
          <View style={styles.legendContainer}>
            {chartData.legend.map((legendText, index) => (
              <View key={legendText} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColorBox,
                    { backgroundColor: chartData.datasets[index].color(1) },
                  ]}
                />
                <Text style={styles.legendText}>{legendText}</Text>
              </View>
            ))}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <LineChart
              data={dataForChart}
              width={chartWidth}
              height={300}
              chartConfig={chartConfig}
              bezier
              style={styles.chartStyle}
              renderDotContent={({ x, y, indexData }) => {
                uniqueKeyCounter.current += 1;
                if (indexData > 0) {
                  return (
                    <SvgText
                      key={uniqueKeyCounter.current}
                      x={x}
                      y={y - 10}
                      fill="black"
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {indexData}
                    </SvgText>
                  );
                }
                return null;
              }}
            />
          </ScrollView>
        </View>
      ) : (
        <Text style={styles.centeredText}>Data grafik tidak tersedia.</Text>
      )}

      <Text style={styles.headerTitle}>Ringkasan Bencana Lainnya</Text>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{ringkasanData?.total ?? 0}</Text>
          <Text style={styles.summaryLabel}>Total Kejadian</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{ringkasanData?.sar ?? 0}</Text>
          <Text style={styles.summaryLabel}>Search & Rescue</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {ringkasanData?.pohonTumbang ?? 0}
          </Text>
          <Text style={styles.summaryLabel}>Pohon Tumbang</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{ringkasanData?.longsor ?? 0}</Text>
          <Text style={styles.summaryLabel}>Longsor</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{ringkasanData?.banjir ?? 0}</Text>
          <Text style={styles.summaryLabel}>Banjir</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {ringkasanData?.trafficAccident ?? 0}
          </Text>
          <Text style={styles.summaryLabel}>Kecelakaan</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {ringkasanData?.buildingCollapse ?? 0}
          </Text>
          <Text style={styles.summaryLabel}>Bangunan Runtuh</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {ringkasanData?.animalRescue ?? 0}
          </Text>
          <Text style={styles.summaryLabel}>Animal Rescue</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {ringkasanData?.lainLain ?? 0}
          </Text>
          <Text style={styles.summaryLabel}>Lain-lain</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const chartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForDots: { r: "4", strokeWidth: "2" },
  propsForBackgroundLines: { strokeDasharray: "", stroke: "#e3e3e3" },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  summaryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 10,
    width: "48%",
    marginBottom: 10,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
  },
  summaryLabel: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
    textAlign: "center",
  },
  chartWrapper: {
    marginHorizontal: 16,
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartStyle: {},
  centeredText: {
    textAlign: "center",
    marginTop: 50,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingLeft: 16,
    paddingBottom: 10,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 5,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    marginRight: 6,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
  },
});
