document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form-sidang');
    const tabelTahanan = document.getElementById('tabel-tahanan').getElementsByTagName('tbody')[0];
    const peringatan = document.getElementById('peringatan');
    const notifikasi = document.getElementById('notifikasi');
    let nomorUrut = 1;
  
    // Tambah baris
    document.getElementById('tambah-baris').addEventListener('click', function () {
      if (tabelTahanan.rows.length < 100) {
        const barisBaru = tabelTahanan.insertRow();
        barisBaru.innerHTML = `
          <td>${nomorUrut}</td>
          <td><input type="text" class="form-control" required></td>
          <td><input type="number" step="0.1" class="form-control vonis" required></td>
          <td>
            <select class="form-select" required>
              <option value="">Pilih</option>
              <option value="Ya">Ya</option>
              <option value="Tidak">Tidak</option>
            </select>
          </td>
          <td><button type="button" class="btn btn-danger btn-sm hapus-baris">Hapus</button></td>
        `;
        nomorUrut++;
      } else {
        alert('Maksimal 100 tahanan per sidang.');
      }
    });
  
    // Hapus baris
    tabelTahanan.addEventListener('click', function (e) {
      if (e.target.classList.contains('hapus-baris')) {
        e.target.closest('tr').remove();
        nomorUrut--;
      }
    });
  
    // Validasi vonis
    tabelTahanan.addEventListener('input', function (e) {
      if (e.target.classList.contains('vonis')) {
        const vonis = parseFloat(e.target.value);
        if (vonis < 1.5) {
          peringatan.textContent = 'Vonis di bawah 1,5 tahun! Penanganan berkas darurat diperlukan.';
          peringatan.classList.remove('d-none');
        } else {
          peringatan.classList.add('d-none');
        }
      }
    });
  
    // Simpan data
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const data = [];
      const rows = tabelTahanan.rows;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const nama = row.cells[1].querySelector('input').value;
        const vonis = row.cells[2].querySelector('input').value;
        const banding = row.cells[3].querySelector('select').value;
        data.push({ nama, vonis, banding });
      }
      console.log(data); // Simpan data ke database atau API
      notifikasi.textContent = 'Data berhasil disimpan!';
      notifikasi.classList.remove('d-none');
      setTimeout(() => notifikasi.classList.add('d-none'), 3000);
    });
  });