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
          const vonis = parseFloat(item.vonis);

          // Filter tahanan dengan vonis di bawah 1,6 tahun
          if (!isNaN(vonis) && vonis < 1.6) {
            const barisBaru = tabelDarurat.insertRow();
            barisBaru.innerHTML = `
              <td>${nomor}</td>
              <td>${item.nama}</td>
              <td>${vonis}</td>
              <td>${item.banding}</td>
              <td>${item.lokasiSidang || 'Tidak ada data'}</td>  <!-- Tampilkan lokasiSidang -->
              <td>${item.tanggalSidang || item.tanggalPenangkapan || 'Tidak ada data'}</td> <!-- Gunakan tanggalSidang atau tanggalPenangkapan -->
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
          tampilkanDataDarurat();
        } catch (error) {
          alert('Gagal menghapus data: ' + error.message);
        }
      }
    }
  });

  // Tampilkan data saat halaman dimuat
  tampilkanDataDarurat();
});