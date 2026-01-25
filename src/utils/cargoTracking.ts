export const getTrackingUrl = (cargoFirm?: string, trackingCode?: string) => {
  if (!cargoFirm || !trackingCode) {
    return null;
  }
  const code = encodeURIComponent(trackingCode);
  const normalizedFirm = cargoFirm.toLocaleLowerCase("tr-TR");
  switch (normalizedFirm) {
    case "yurtiçi":
    case "yurtici":
      return `https://selfservis.yurticikargo.com/reports/SSW/ShipmentDetail.aspx?docId=${code}`;
    case "aras":
      return `https://kargotakip.araskargo.com.tr/mainpage.aspx?code=${code}`;
    case "mng":
      return `https://kargotakip.mngkargo.com.tr/?takipNo=${code}`;
    case "ptt":
      return `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${code}`;
    default:
      return null;
  }
};
