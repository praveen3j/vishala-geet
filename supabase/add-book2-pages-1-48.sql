-- Adds missing Book 2 songs for pages 1-48.
-- Safe to run more than once; it skips rows already present by book, name, and page.

with missing_songs (book, name, page, aliases, notes) as (
  values
  ('Book 2', 'Yedu Lokalu', '1', 'Edu Lokalu, Yedulokalu, Edulokalu, page 1, p1, book 2 page 1, book 2 p1, b2 page 1, b2 p1', ''),
  ('Book 2', 'Krishna Krishna Rave', '2', 'Krushna Krushna Raave, Krsna Krsna Rave, Krishna Raave, page 2, p2, book 2 page 2, book 2 p2, b2 page 2, b2 p2', ''),
  ('Book 2', 'Palaya Govinda', '2', 'Paalaya Govinda, Palaya Govindha, page 2, p2, book 2 page 2, book 2 p2, b2 page 2, b2 p2', ''),
  ('Book 2', 'Achyuta Ramakirti', '3', 'Achyutha Rama Keerthi, Atchyuta Ramakirti, Rama Keerthi, page 3, p3, book 2 page 3, book 2 p3, b2 page 3, b2 p3', ''),
  ('Book 2', 'Gajjelu Delu Mocha', '4', 'Gajjelu Delu, Gajjelu, Gajjelu Song, page 4, p4, book 2 page 4, book 2 p4, b2 page 4, b2 p4', ''),
  ('Book 2', 'Batukamma', '5', 'Bathukamma, Batukamma Song, Bathukamma Paata, page 5, p5, book 2 page 5, book 2 p5, b2 page 5, b2 p5', 'Bathukamma festival song'),
  ('Book 2', 'Okkasari Rava', '6', 'Okkasaari Raava, Vokkasari Rava, Okkasari, page 6, p6, book 2 page 6, book 2 p6, b2 page 6, b2 p6', ''),
  ('Book 2', 'Adugu Kalipenu', '7', 'Adugu Kalipenu Song, Adugu, Kalipenu, page 7, p7, book 2 page 7, book 2 p7, b2 page 7, b2 p7', ''),
  ('Book 2', 'Sri Venkatesham', '8', 'Shree Venkatesham, Sri Venkatesam, Venkateswara, page 8, p8, book 2 page 8, book 2 p8, b2 page 8, b2 p8', ''),
  ('Book 2', 'Kodanda Ramudu', '9', 'Kodandha Ramudu, Kodanda Ramudu Song, Rama, page 9, p9, book 2 page 9, book 2 p9, b2 page 9, b2 p9', ''),
  ('Book 2', 'Kondala Chennamma', '10', 'Kondala Chennama, Chennamma Song, page 10, p10, book 2 page 10, book 2 p10, b2 page 10, b2 p10', ''),
  ('Book 2', 'Nagumomu', '11', 'Nagumomu Ganaleni, Nagumomu Song, Thyagaraja Keerthana, page 11, p11, book 2 page 11, book 2 p11, b2 page 11, b2 p11', ''),
  ('Book 2', 'Venkateshudu Ma', '12', 'Venkatesudu Ma, Venkateswarudu, Venkateshudu, page 12, p12, book 2 page 12, book 2 p12, b2 page 12, b2 p12', ''),
  ('Book 2', 'Rama Lali Neela', '13', 'Rama Laali Neela, Rama Lali, Lali Song, page 13, p13, book 2 page 13, book 2 p13, b2 page 13, b2 p13', ''),
  ('Book 2', 'Nanda Lali', '14', 'Nandha Laali, Nanda Laali, Krishna Lali, page 14, p14, book 2 page 14, book 2 p14, b2 page 14, b2 p14', ''),
  ('Book 2', 'Rama Bhajan', '14', 'Rama Bhajana, Ram Bhajan, page 14, p14, book 2 page 14, book 2 p14, b2 page 14, b2 p14', ''),
  ('Book 2', 'Ganapathi Talam', '15', 'Ganapati Talam, Ganapathi Taalam, Ganesh Talam, page 15, p15, book 2 page 15, book 2 p15, b2 page 15, b2 p15', ''),
  ('Book 2', 'Nanda Yashoda', '18', 'Nandha Yashoda, Nanda Yasoda, Yashoda Krishna, page 18, p18, book 2 page 18, book 2 p18, b2 page 18, b2 p18', ''),
  ('Book 2', 'Bala Tripura Sundari', '19', 'Bala Thripura Sundari, Tripura Sundari, page 19, p19, book 2 page 19, book 2 p19, b2 page 19, b2 p19', ''),
  ('Book 2', 'Rama Sita Rama', '19', 'Rama Seetha Rama, Sita Rama, Seetha Rama, page 19, p19, book 2 page 19, book 2 p19, b2 page 19, b2 p19', ''),
  ('Book 2', 'Sri Ramula Divya', '20', 'Shree Ramula Divya, Sri Ramula Divya Namam, page 20, p20, book 2 page 20, book 2 p20, b2 page 20, b2 p20', ''),
  ('Book 2', 'Sri Rama Namame Jihva', '21', 'Sri Rama Namame Jihva, Rama Namame Jihva, page 21, p21, book 2 page 21, book 2 p21, b2 page 21, b2 p21', ''),
  ('Book 2', 'Guruvayur Song', '22', 'Guruvayoor Song, Guruvayurappa, page 22, p22, book 2 page 22, book 2 p22, b2 page 22, b2 p22', ''),
  ('Book 2', 'Krishna Bhajan', '22', 'Krushna Bhajan, Krishna Bhajana, page 22, p22, book 2 page 22, book 2 p22, b2 page 22, b2 p22', ''),
  ('Book 2', 'Rama Rama Prarthana', '23', 'Rama Rama Prardhana, Rama Prarthana, page 23, p23, book 2 page 23, book 2 p23, b2 page 23, b2 p23', ''),
  ('Book 2', 'Ganapathi Katavaku', '24', 'Ganapati Katavaku, Ganapathi Song, page 24, p24, book 2 page 24, book 2 p24, b2 page 24, b2 p24', ''),
  ('Book 2', 'Aadi Shakti Nee', '25', 'Adi Shakti Nee, Aadhi Shakthi Nee, Devi Song, page 25, p25, book 2 page 25, book 2 p25, b2 page 25, b2 p25', ''),
  ('Book 2', 'Om Ganapathi', '26', 'Om Ganapati, Om Ganesh, page 26, p26, book 2 page 26, book 2 p26, b2 page 26, b2 p26', ''),
  ('Book 2', 'Sri Chakra Puramandhu', '27', 'Shree Chakra Puramandu, Sri Chakra Puram, page 27, p27, book 2 page 27, book 2 p27, b2 page 27, b2 p27', ''),
  ('Book 2', 'Sri Kari Shubhakari', '27', 'Shree Kari Shubhakari, Sri Kari Subhakari, page 27, p27, book 2 page 27, book 2 p27, b2 page 27, b2 p27', ''),
  ('Book 2', 'Sirisirimucca Sri', '28', 'Siri Siri Mucca, Sirisirimucca, page 28, p28, book 2 page 28, book 2 p28, b2 page 28, b2 p28', ''),
  ('Book 2', 'Naga Stuti', '30', 'Naga Sthuthi, Nagula Chavithi Song, page 30, p30, book 2 page 30, book 2 p30, b2 page 30, b2 p30', ''),
  ('Book 2', 'Mangalam Shambu', '31', 'Mangalam Shambhu, Mangalam Shambo, Shiva Mangalam, page 31, p31, book 2 page 31, book 2 p31, b2 page 31, b2 p31', ''),
  ('Book 2', 'Krishnam Vande Jagad', '32', 'Krushnam Vande Jagadgurum, Krishnam Vande, page 32, p32, book 2 page 32, book 2 p32, b2 page 32, b2 p32', ''),
  ('Book 2', 'Kamakshi Kalyani', '35', 'Kamakshy Kalyani, Kamakshi Song, page 35, p35, book 2 page 35, book 2 p35, b2 page 35, b2 p35', ''),
  ('Book 2', 'Om Sai Sri Sai', '35', 'Om Sai Shree Sai, Sai Baba Song, page 35, p35, book 2 page 35, book 2 p35, b2 page 35, b2 p35', ''),
  ('Book 2', 'Harati Gekonuma Saraswati', '36', 'Haarathi Gekonuma Saraswathi, Saraswati Harati, page 36, p36, book 2 page 36, book 2 p36, b2 page 36, b2 p36', ''),
  ('Book 2', 'Govardhan Giridhari', '37', 'Govardhana Giridhari, Giridhari Song, page 37, p37, book 2 page 37, book 2 p37, b2 page 37, b2 p37', ''),
  ('Book 2', 'Yedukula Talli Sri', '37', 'Edukula Talli Sri, Yedukula Thalli, page 37, p37, book 2 page 37, book 2 p37, b2 page 37, b2 p37', ''),
  ('Book 2', 'Ninnu Vidichi Unda', '38', 'Ninnu Vidichi Undalenu, Ninnu Vidichi, page 38, p38, book 2 page 38, book 2 p38, b2 page 38, b2 p38', ''),
  ('Book 2', 'Sri Vani Kala', '38', 'Shree Vani Kala, Sri Vaani Kala, page 38, p38, book 2 page 38, book 2 p38, b2 page 38, b2 p38', ''),
  ('Book 2', 'Nalla Nallani', '39', 'Nala Nalani, Nalla Nallani Song, page 39, p39, book 2 page 39, book 2 p39, b2 page 39, b2 p39', ''),
  ('Book 2', 'Vaibhavam Venkata', '40', 'Vaibhavam Venkata, Venkata Vaibhavam, page 40, p40, book 2 page 40, book 2 p40, b2 page 40, b2 p40', ''),
  ('Book 2', 'Andal Kanhayya', '41', 'Aandal Kanhayya, Andal Kanaya, page 41, p41, book 2 page 41, book 2 p41, b2 page 41, b2 p41', ''),
  ('Book 2', 'Uyyalaluguchunnadu', '41', 'Uyyala Luguchunnadu, Uyyala Song, page 41, p41, book 2 page 41, book 2 p41, b2 page 41, b2 p41', ''),
  ('Book 2', 'Krishna Krishna', '42', 'Krushna Krushna, Krsna Krsna, page 42, p42, book 2 page 42, book 2 p42, b2 page 42, b2 p42', ''),
  ('Book 2', 'Bhaktula Pujita Bharade', '43', 'Bhaktula Poojitha Bharade, Bharade Song, page 43, p43, book 2 page 43, book 2 p43, b2 page 43, b2 p43', 'Also referenced on page 45'),
  ('Book 2', 'Chudi Kuduta', '44', 'Choodi Kuduta, Chudi Kudutha, page 44, p44, book 2 page 44, book 2 p44, b2 page 44, b2 p44', ''),
  ('Book 2', 'Tulasi Dalamata', '46', 'Thulasi Dalamata, Tulasi Dalamatha, page 46, p46, book 2 page 46, book 2 p46, b2 page 46, b2 p46', ''),
  ('Book 2', 'Bangar Kamala', '47', 'Bangaru Kamala, Bangar Kamala, page 47, p47, book 2 page 47, book 2 p47, b2 page 47, b2 p47', ''),
  ('Book 2', 'Kirtayya Gopal', '48', 'Keertayya Gopal, Kirtayya Gopala, page 48, p48, book 2 page 48, book 2 p48, b2 page 48, b2 p48', ''),
  ('Book 2', 'Ramudu Udbhavinchi', '48', 'Ramudu Udbhavinchi, Rama Udbhavinchi, page 48, p48, book 2 page 48, book 2 p48, b2 page 48, b2 p48', '')
)
insert into public.songs (book, name, page, aliases, notes)
select book, name, page, aliases, notes
from missing_songs m
where not exists (
  select 1
  from public.songs s
  where lower(s.book) = lower(m.book)
    and lower(s.name) = lower(m.name)
    and s.page = m.page
);
