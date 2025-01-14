document.addEventListener('DOMContentLoaded', async function () {
  const formSidang = document.getElementById('form-sidang');
  const tabelTahanan = document.getElementById('tabel-tahanan').getElementsByTagName('tbody')[0];
  const tabelData = document.getElementById('tabel-data').getElementsByTagName('tbody')[0];
  const notifikasi = document.getElementById('notifikasi');
  const cariTahanan = document.getElementById('cari-tahanan');

  // Fungsi untuk menambahkan baris ke tabel input
  document.getElementById('tambah-baris').addEventListener('click', function () {
    const barisBaru = tabelTahanan.insertRow();
    barisBaru.innerHTML = `
      <td>${tabelTahanan.rows.length + 1}</td>
      <td><input type="text" class="form-control" placeholder="Nama Tahanan" required></td>
      <td><input type="number" class="form-control" placeholder="Vonis (Tahun)" step="0.1" required></td>
      <td>
        <select class="form-select" required>
          <option value="Ya">Ya</option>
          <option value="Tidak">Tidak</option>
        </select>
      </td>
      <td><button type="button" class="btn btn-danger btn-sm hapus-baris">Hapus</button></td>
    `;
  });

  // Fungsi untuk menghapus baris dari tabel input
  tabelTahanan.addEventListener('click', function (e) {
    if (e.target.classList.contains('hapus-baris')) {
      e.target.closest('tr').remove();
    }
  });

  // Fungsi untuk menyimpan data ke Firebase
  formSidang.addEventListener('submit', async function (e) {
    e.preventDefault();

    const lokasiSidang = document.getElementById('lokasi-sidang').value;
    const tanggalSidang = document.getElementById('tanggal-sidang').value;
    const dataTahanan = [];

    // Ambil data dari tabel input
    for (let i = 0; i < tabelTahanan.rows.length; i++) {
      const row = tabelTahanan.rows[i];
      const nama = row.cells[1].querySelector('input').value;
      const vonis = parseFloat(row.cells[2].querySelector('input').value);
      const banding = row.cells[3].querySelector('select').value;

      dataTahanan.push({
        nama,
        vonis,
        banding,
        lokasiSidang,
        tanggalSidang
      });
    }

    // Simpan data ke Firebase
    try {
      const data = await window.db.getAllTahanan();
      const newData = data ? data : {};
      dataTahanan.forEach((item, index) => {
        newData[`tahanan${Date.now() + index}`] = item;
      });
      await window.db.saveTahanan(newData);
      notifikasi.textContent = 'Data berhasil disimpan!';
      notifikasi.classList.remove('d-none');
      setTimeout(() => notifikasi.classList.add('d-none'), 3000);
      tampilkanDataTahanan();
    } catch (error) {
      console.error('Gagal menyimpan data:', error);
      alert('Terjadi kesalahan saat menyimpan data.');
    }
  });

  // Fungsi untuk menampilkan data tahanan yang disimpan
  async function tampilkanDataTahanan() {
    try {
      const data = await window.db.getAllTahanan();
      tabelData.innerHTML = '';

      if (data && typeof data === 'object') {
        let nomor = 1;
        for (const key in data) {
          const item = data[key];
          const barisBaru = tabelData.insertRow();
          barisBaru.innerHTML = `
            <td>${nomor}</td>
            <td>${item.nama}</td>
            <td>${item.vonis}</td>
            <td>${item.banding}</td>
            <td>${item.lokasiSidang}</td>
            <td>${item.tanggalSidang}</td>
            <td>
              <button class="btn btn-danger btn-sm hapus-data" data-key="${key}">Hapus</button>
            </td>
          `;
          nomor++;
        }
      } else {
        tabelData.innerHTML = `<tr><td colspan="7" class="text-center">Tidak ada data tahanan.</td></tr>`;
      }
    } catch (error) {
      console.error('Gagal memuat data:', error);
      tabelData.innerHTML = `<tr><td colspan="7" class="text-center">Terjadi kesalahan saat memuat data.</td></tr>`;
    }
  }

  // Fungsi untuk menghapus data tahanan
  tabelData.addEventListener('click', async function (e) {
    if (e.target.classList.contains('hapus-data')) {
      const konfirmasi = confirm('Apakah Anda yakin ingin menghapus data ini?');
      if (konfirmasi) {
        try {
          const key = e.target.getAttribute('data-key');
          const data = await window.db.getAllTahanan();
          delete data[key];
          await window.db.saveTahanan(data);
          tampilkanDataTahanan();
        } catch (error) {
          alert('Gagal menghapus data: ' + error.message);
        }
      }
    }
  });

  // Fungsi untuk mencari tahanan
  cariTahanan.addEventListener('input', async function () {
    const keyword = cariTahanan.value.toLowerCase();
    const data = await window.db.getAllTahanan();
    tabelData.innerHTML = '';

    if (data && typeof data === 'object') {
      let nomor = 1;
      for (const key in data) {
        const item = data[key];
        if (item.nama.toLowerCase().includes(keyword)) {
          const barisBaru = tabelData.insertRow();
          barisBaru.innerHTML = `
            <td>${nomor}</td>
            <td>${item.nama}</td>
            <td>${item.vonis}</td>
            <td>${item.banding}</td>
            <td>${item.lokasiSidang}</td>
            <td>${item.tanggalSidang}</td>
            <td>
              <button class="btn btn-danger btn-sm hapus-data" data-key="${key}">Hapus</button>
            </td>
          `;
          nomor++;
        }
      }

      if (nomor === 1) {
        tabelData.innerHTML = `<tr><td colspan="7" class="text-center">Tidak ada hasil pencarian.</td></tr>`;
      }
    } else {
      tabelData.innerHTML = `<tr><td colspan="7" class="text-center">Tidak ada data tahanan.</td></tr>`;
    }
  });

  // Tampilkan data saat halaman dimuat
  tampilkanDataTahanan();
});