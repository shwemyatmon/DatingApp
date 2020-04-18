using System.Linq;
using AutoMapper;
using DatingApp.API.DTOs;
using DatingApp.API.Models;

namespace DatingApp.API.Helpers
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
             CreateMap<User, UserForListDto>()
            .ForMember(dest => dest.PhotoUrl, opt => opt.MapFrom(
                src => src.Photos.FirstOrDefault(u => u.IsMain).Url))
            .ForMember(dest => dest.Age, opt => opt.MapFrom(
                src => src.DateofBirth.CalcaulateAge()));

           
            CreateMap<Photo, PhotoForDetailedDto>();
            CreateMap<UserForUpdateDto,User>();
            CreateMap<Photo,PhotoForReturnDto>();
            CreateMap<PhotoForCreationDto, Photo>();
            CreateMap<UserForRegisterDto, User>();
            CreateMap<MessageForCreationDto,Message>().ReverseMap();
            CreateMap<Message,MessageForReturnDto>()
            .ForMember(dest => dest.SenderPhotoUrl, opt => opt.MapFrom(
                src => src.Sender.Photos.FirstOrDefault(p => p.IsMain).Url
            ))
            .ForMember(dest => dest.RecipientPhotoUrl, opt => opt.MapFrom(
                src => src.Recipient.Photos.FirstOrDefault(p => p.IsMain).Url
            ));

             CreateMap<User, UserForDetailDto>()
             .ForMember(dest => dest.PhotoUrl, opt => opt.MapFrom(
                src => src.Photos.FirstOrDefault(u => u.IsMain).Url))
                 .ForMember(dest => dest.Age, opt => opt.MapFrom(
                src => src.DateofBirth.CalcaulateAge()));
        }
    }
}