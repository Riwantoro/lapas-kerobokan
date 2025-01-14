document.addEventListener('DOMContentLoaded', async function () {
  const tabelDarurat = document.getElementById('tabel-darurat').getElementsByTagName('tbody')[0];

  // Fungsi untuk menampilkan data darurat
  async function tampilkanDataDarurat() {
    try {
      const data = await window.db.getAllTahanan();  // Ambil data dari path /tahanan
      console.log(data);  // Debugging: Lihat data yang diambil dari Firebase
      tabelDarurat.innerHTML = '';

      if (data && typeof data === 'object') {
        let nomor = 1;
        for (const key in data) {
          const item = data[key];

          // Pastikan vonis adalah angka
          const vonisBulan = parseInt(item.vonisBulan);

          // Filter tahanan dengan vonis di bawah 12 bulan (1 tahun)
          if (!isNaN(vonisBulan) && vonisBulan < 12) {
            const barisBaru = tabelDarurat.insertRow();
            barisBaru.innerHTML = `
              <td>${nomor}</td>
              <td>${item.nama}</td>
              <td>${vonisBulan} bulan</td> <!-- Tampilkan vonis dalam bulan -->
              <td>${item.banding}</td>
              <td>${item.lokasiSidang || 'Tidak ada data'}</td>  <!-- Tampilkan lokasiSidang -->
              <td>${item.tanggalSidang || 'Tidak ada data'}</td> <!-- Tampilkan tanggalSidang -->
              <td>
                <button class="btn btn-danger btn-sm hapus-data" data-key="${key}">Hapus</button>
              </td>
            `;
            nomor++;
          }
        }

        // Jika tidak ada data yang memenuhi kriteria
        if (nomor === 1) {
          tabelDarurat.innerHTML = `<tr><td colspan="7" class="text-center">Tidak ada tahanan darurat.</td></tr>`;
        }
      } else {
        tabelDarurat.innerHTML = `<tr><td colspan="7" class="text-center">Tidak ada data tahanan darurat.</td></tr>`;
      }
    } catch (error) {
      console.error('Gagal memuat data darurat:', error);
      tabelDarurat.innerHTML = `<tr><td colspan="7" class="text-center">Terjadi kesalahan saat memuat data.</td></tr>`;
    }
  }

  // Fungsi untuk menghapus data darurat
  tabelDarurat.addEventListener('click', async function (e) {
    if (e.target.classList.contains('hapus-data')) {
      const konfirmasi = confirm('Apakah Anda yakin ingin menghapus data ini?');
      if (konfirmasi) {
        try {
          const key = e.target.getAttribute('data-key');
          const data = await window.db.getAllTahanan();
          delete data[key];
          await window.db.saveTahanan(data);

          // Animasi menghapus baris
          const row = e.target.closest('tr');
          row.style.transition = 'opacity 0.3s ease';
          row.style.opacity = '0';
          setTimeout(() => row.remove(), 300); // Hapus baris setelah animasi selesai

          tampilkanDataDarurat();
        } catch (error) {
          alert('Gagal menghapus data: ' + error.message);
        }
      }
    }
  });

  // Fungsi untuk mengekspor data ke Excel
  document.getElementById('ekspor-excel').addEventListener('click', async function () {
    try {
      const data = await window.db.getAllTahanan();  // Ambil data dari Firebase
      const dataFiltered = [];

      // Filter data dengan vonis di bawah 12 bulan (1 tahun)
      for (const key in data) {
        const item = data[key];
        const vonisBulan = parseInt(item.vonisBulan);
        if (!isNaN(vonisBulan) && vonisBulan < 12) {
          dataFiltered.push({
            No: dataFiltered.length + 1,
            Nama: item.nama,
            Vonis: `${item.vonisBulan} bulan`, // Tampilkan vonis dalam bulan
            Banding: item.banding,
            Lokasi: item.lokasiSidang || 'Tidak ada data',
            Tanggal: item.tanggalSidang || 'Tidak ada data'
          });
        }
      }

      // Buat worksheet dari data
      const worksheet = XLSX.utils.json_to_sheet(dataFiltered);

      // Buat workbook dan tambahkan worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tahanan Darurat');

      // Ekspor ke file Excel
      XLSX.writeFile(workbook, 'tahanan_darurat.xlsx');

      alert('Data berhasil diekspor ke Excel!');
    } catch (error) {
      console.error('Gagal mengekspor data:', error);
      alert('Terjadi kesalahan saat mengekspor data.');
    }
  });

  // Tampilkan data saat halaman dimuat
  tampilkanDataDarurat();
});