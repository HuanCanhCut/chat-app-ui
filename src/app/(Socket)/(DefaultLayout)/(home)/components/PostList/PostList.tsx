'use client'

import React from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { toast } from 'sonner'
import { KeyedMutator } from 'swr'

import PostItem from '../../../../../../components/PostItem/PostItem'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as postService from '~/services/postService'
import { GetPostResponse } from '~/type/post.type'

const LIMIT = 10

interface PostListProps {
    posts: GetPostResponse
    mutatePost: KeyedMutator<GetPostResponse>
}

const PostList: React.FC<PostListProps> = ({ posts, mutatePost }) => {
    return (
        <div>
            {posts?.data && (
                <InfiniteScroll
                    dataLength={posts?.data.length || 0}
                    next={async () => {
                        try {
                            const response = await postService.getPosts({
                                limit: LIMIT,
                                cursor: posts?.meta.pagination.next_cursor,
                            })

                            const newData = {
                                ...posts,
                                data: [...posts.data, ...response.data],
                                meta: {
                                    ...posts.meta,
                                    pagination: {
                                        ...response.meta.pagination,
                                    },
                                },
                            }

                            mutatePost(newData, false)
                        } catch (error) {
                            toast.error('Lỗi khi tải thêm tin')
                        }
                    }}
                    className="flex flex-col gap-3 overflow-hidden!"
                    hasMore={posts?.meta.pagination.has_next_page || false}
                    scrollThreshold={0.8}
                    loader={
                        <div className="flex justify-center">
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        </div>
                    }
                >
                    {posts?.data.map((post) => {
                        return (
                            <React.Fragment key={post.id}>
                                <PostItem post={post} />
                            </React.Fragment>
                        )
                    })}
                </InfiniteScroll>
            )}
        </div>
    )
}

export default PostList
