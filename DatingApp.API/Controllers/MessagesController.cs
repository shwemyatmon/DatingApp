using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.DTOs;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DatingApp.API.Controllers
{
    [ServiceFilter(typeof(LogUserActivity))]
    [Authorize]
    [Route("api/users/{userId}/[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        private readonly IDatingRepository _repo;
        private readonly IMapper _mapper;

        public MessagesController(IDatingRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        [HttpGet("{id}",Name="GetMessage")]
        public async Task<IActionResult> GetMessage(int userId,int id){
               if(userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) {
                return Unauthorized();
            }

            var messageFromRepo =await _repo.GetMessage(id);

            if(messageFromRepo == null){
                return NotFound();
            }

            return Ok(messageFromRepo);
        }

        [HttpGet]
        public async Task<IActionResult> GetMessageForUser(int userId,
        [FromQuery] MessageParams messageParams){
               if(userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) {
                return Unauthorized();
            }
            messageParams.UserId= userId;
            var messagesFromRepo = await _repo.GetMessagesForUser(messageParams);
           
            var messages = _mapper.Map<IEnumerable<MessageForReturnDto>>(messagesFromRepo);

            Response.AddPagination(messagesFromRepo.CurrentPage
            ,messagesFromRepo.PageSize,
            messagesFromRepo.TotalCount,messagesFromRepo.TotalPages);

            return Ok(messages);


        }

        [HttpGet("thread/{recipientId}")]
        public async Task<IActionResult> GetMessageThread(int userId,int recipientId){
             if(userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) {
                return Unauthorized();
            }
            var messagesFromRepo=await _repo.GetMessgeThread(userId,recipientId);

            var messageThread= _mapper.Map<IEnumerable<MessageForReturnDto>>(messagesFromRepo);
            return Ok(messageThread);
        }

        [HttpPost]
        public async Task<IActionResult> CreateMessage(int userId,MessageForCreationDto messageforCreationDto){
            var sender = await _repo.GetUser(userId);
            
             if(sender.Id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) {
                return Unauthorized();
            }

            messageforCreationDto.SenderId = userId;
            var recipient = await _repo.GetUser(messageforCreationDto.RecipientId);
            if(recipient == null){
                return BadRequest("Could not find user");
            }

            var message = _mapper.Map<Message>(messageforCreationDto);

            _repo.Add(message);

         
            if(await _repo.SaveAll()){
               var messageToReturn = _mapper.Map<MessageForReturnDto>(message);
               return CreatedAtRoute("GetMessage", new { userId,id = message.Id},messageToReturn);
            }
          throw new Exception("Could not sent message to this user");

        }

        [HttpPost("{id}")]
        public async Task<IActionResult> DeleteMessage(int id, int userId){
             if(userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) {
                return Unauthorized();
            }
            var messageFromRepo = await _repo.GetMessage(id);

            if(messageFromRepo.SenderId == userId)
                 messageFromRepo.SenderDeleted = true;
            if(messageFromRepo.RecipientId == userId) 
                messageFromRepo.RecipentDeleted = true;

            if(messageFromRepo.SenderDeleted && messageFromRepo.RecipentDeleted){
                _repo.Delete(messageFromRepo);
            }

            if(await _repo.SaveAll())
                return NoContent();

            throw new Exception("Error while deleting message.");

        }

        [HttpPost("{id}/read")]
        public async Task<IActionResult> MarkMessageAsRead(int id,int userId) {
            if(userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) {
                return Unauthorized();
            }
            var messageFromRepo = await _repo.GetMessage(id);
            if(messageFromRepo.RecipientId != userId) 
                return Unauthorized();

            messageFromRepo.IsRead =true;
            messageFromRepo.DateRead = DateTime.Now;

            await _repo.SaveAll();

            return NoContent();

        }

        



    }
}