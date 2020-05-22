axios.defaults.baseURL = "https://itunes.apple.com/";

app = new Vue({
    el: '#app',
    data: {
        //titulo: 'Hola mundo!',
        search: "rock",
        albums: [],
        page: 0,
        type: "album",
        imgmusicAlbum: null,
        musicAlbum: null,
        musicArtist: null,
        musicGenre: null,
        musicTraks: [],
        ids: [],
        audio: null,
        active: null,
        activeMusic: false,
        processing: {
            album: false,
            music: false,
        },
    },
    created() {},
    methods: {
        nextPage() {
            this.page++;
            this.getAlbum();
        },
        sendForm() {
            this.page = 0;
            this.ids = [];
            this.albums = [];
            this.getAlbum();
        },
        async getAlbum() {
            window.onscroll = () => {
                let bottomOfWindow = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight;

                if (bottomOfWindow) {

                    this.processing.music = true;
                    this.nextPage();
                }

            };
            console.log("OK");
            this.processing.album = true;
            await axios
                .get(`search?term=${encodeURIComponent( this.search)}&country=MX&media=music&entity=${this.type}&limit=20&offset=${this.page * 20}`)
                .then((resp) => {
                    console.log("OK", resp);
                    let albums = resp.data.results.filter(function(album) {
                        return album.trackCount > 3
                    });
                    albums.forEach((v, k) => {
                        console.log("albums[k].artworkUrl100", v);
                        v.artworkUrl100 = v.artworkUrl100.replace("100x100bb", "300x300bb");
                        if (this.ids.indexOf(v.collectionId) < 0) {
                            this.albums.push(v);
                            this.ids.push(v.collectionId);
                        }
                    });
                    this.albums.sort(function(a, b) {
                        return Date.parse(b.releaseDate) - Date.parse(a.releaseDate);
                    });
                    this.processing.album = false;
                })
                .catch((error) => {
                    // console.log(error);
                    this.processing.album = false;
                });
        },
        async getMusic(dni) {
            this.activeMusic = true;
            this.active = null;

            if (this.audio) {
                this.audio.pause();
                this.audio = null;
            }

            this.processing.music = true;

            await axios
                .get(`https://itunes.apple.com/lookup?id=${dni}&entity=song`)
                .then((resp) => {
                    if (resp.data.resultCount > 0) {
                        this.imgmusicAlbum = resp.data.results[0].artworkUrl100;
                        this.musicAlbum = resp.data.results[0].collectionName;
                        this.musicArtist = resp.data.results[0].artistName;
                        this.musicGenre = resp.data.results[0].primaryGenreName;
                        let i = 0;
                        this.musicTraks = [];
                        resp.data.results.forEach((element, index) => {
                            if (index > 0) {
                                this.musicTraks[i] = element;
                                i++;
                            }
                        });
                        this.processing.music = false;
                    }
                })
                .catch((err) => {
                    this.processing.music = false;
                    // console.log(err)
                });
        },
        play(audio) {

            console.log(audio);

            if (this.audio) {
                this.audio.pause();
            }
            this.audio = new Audio(audio);
            this.audio.play();
        },
        stop(audio) {

            this.audio = new Audio(audio);
            this.audio.stop();
        }
    }
})