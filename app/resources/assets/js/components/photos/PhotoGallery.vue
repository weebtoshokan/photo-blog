<template>
    <div class="container">
        <loader :loading="loading"></loader>
        <div v-if="photos.length" class="row">
            <div class="col py-1">
                <masonry ref="masonry" :images="photos"></masonry>
            </div>
        </div>
        <div v-if="!loading && !photos.length" class="row">
            <div class="col mt-3">
                <div class="alert alert-secondary">No photos found</div>
            </div>
        </div>
        <div v-if="previousPageExists || nextPageExists" class="row">
            <div class="col mt-2">
                <router-link
                        v-if="previousPageExists"
                        :to="{name: this.routeName, params: {page: this.previousPage}}"
                        class="btn btn-secondary float-left"
                        title="Previous Page">Previous
                </router-link>
                <router-link
                        v-if="nextPageExists"
                        :to="{name: this.routeName, params: {page: this.nextPage}}"
                        class="btn btn-secondary float-right"
                        title="Next Page">Next
                </router-link>
            </div>
        </div>
    </div>
</template>

<script>
    import {waitUntil} from "tooleks";
    import Loader from "../utils/Loader";
    import Masonry from "../gallery/Masonry";
    import {GoToMixin, MetaMixin} from "../../mixins";
    import {_PAGE_SUFFIX} from "../../router/names";

    export default {
        components: {
            Loader,
            Masonry,
        },
        mixins: [
            GoToMixin,
            MetaMixin,
        ],
        data: function () {
            return {
                loading: false,
                photos: [],
                previousPage: null,
                currentPage: 1,
                nextPage: null,
                previousPageExists: false,
                nextPageExists: false,
            };
        },
        computed: {
            routeName: function () {
                return this.$route.name.endsWith(_PAGE_SUFFIX) ? this.$route.name : `${this.$route.name}${_PAGE_SUFFIX}`;
            },
            pageTitle: function () {
                if (this.$route.params.search_phrase) {
                    return `Search "${this.$route.params.search_phrase}"`;
                }
                if (this.$route.params.tag) {
                    return `Search by tag #${this.$route.params.tag}`;
                }
                return "All photos";
            },
        },
        watch: {
            "$route": function () {
                this.init();
            },
            currentPage: function (currentPage) {
                if (currentPage > 1) {
                    this.$router.push({
                        name: this.routeName,
                        params: {page: currentPage},
                        hash: this.$route.hash,
                    });
                }
            },
            photos: function () {
                // Wait until "masonry" reference will be available then scroll to an active image.
                waitUntil(() => this.$refs.masonry).then((masonry) => {
                    const id = this.$route.hash.slice(1);
                    if (id) {
                        masonry.scrollToImageById(id);
                    }
                });
            },
        },
        methods: {
            init: function () {
                if (this.$route.query.show) {
                    // #bc: Go to a new photo page in order to preserve backward compatibility
                    // with an older version of the application.
                    this.goToPhotoPage(this.$route.query.show);
                } else {
                    this.loadPhotos();
                }
            },
            setPhotos: function ({items, previousPageExists, nextPageExists, currentPage, nextPage, previousPage}) {
                this.photos = items;
                this.previousPageExists = previousPageExists;
                this.nextPageExists = nextPageExists;
                this.currentPage = currentPage;
                this.nextPage = nextPage;
                this.previousPage = previousPage;
            },
            loadPhotos: async function () {
                this.loading = true;
                try {
                    const response = await this.$dc.get("api").getPosts({...this.$route.params, per_page: 40});
                    const photos = this.$dc.get("mapper").map(response, "Api.Raw.Posts", "Meta.Photos");
                    this.setPhotos(photos);
                } finally {
                    this.loading = false;
                }
            },
        },
        created: function () {
            this.init();
        },
    }
</script>
