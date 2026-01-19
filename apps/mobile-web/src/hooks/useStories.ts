import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { StoryController } from '../presentation/controllers/story-controller'
import { CreateStoryRequest } from '../presentation/dto/story-dto'

const storyController = new StoryController()

export const useStories = () => {
  return useQuery({
    queryKey: ['stories'],
    queryFn: () => storyController.getUserStories('current'), // In real app, pass actual user ID
  })
}

export const useCreateStory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateStoryRequest) => 
      storyController.createStory('current', request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] })
    },
  })
}

export const useViewStory = () => {
  return useMutation({
    mutationFn: (storyId: string) => 
      storyController.viewStory(storyId, 'current'),
  })
}

export const useAddReaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ storyId, reactionType }: { storyId: string, reactionType: string }) => 
      storyController.addReaction(storyId, 'current', reactionType),
    onSuccess: (_, { storyId }) => {
      queryClient.invalidateQueries({ queryKey: ['stories', storyId] })
    },
  })
}
