;(function() {

	/**
	 * Component: ContactsPanel
	 *
	 * Responsibilities:
	 *   - Display all the ContactsPanel Content of the ContactsPanel screen. (today below the TobBar)
	 *
	 * Constructor Data:
	 *  - none
	 *
	 * Component API:
	 *  format: [method_name]([args]) : [concise description]
	 *  - none
	 *
	 * Component Events:
	 *  format: [ComponentName_[DO]_event_name]([argument | argumentsMap]): [concise description]
	 * - none
	 *
	 */
	(function($) {

		// --------- Component Interface Implementation ---------- //
		function ContactsPanel() {
		};

		ContactsPanel.prototype.create = function(data, config) {
			data = data || {};
			this.groupId = data.groupId || "";
			var createDfd = $.Deferred();
			brite.dao.get("Group",data.groupId).done(function(group){
				var groupName = "All"
				if(group){
					groupName = group.name;
				}
				data.groupName = groupName;
				var html = $("#tmpl-ContactsPanel").render(data);
				var $e = $(html);
				createDfd.resolve($e);
			});
			return createDfd.promise();
		}


		ContactsPanel.prototype.postDisplay = function(data, config) {
			var c = this;
			var $e = c.$element;
			var mainScreen = $e.bComponent("MainScreen");
			
			refresh.call(c);
			mainScreen.$element.on("MainScreen_CONTACTSPANEL_REFRESH",function(){
				refresh.call(c);
			});
			
			$e.on("btap",".btnBack",function(){
				brite.display("GroupsPanel",{},{transition:"slideLeft"});
			});
			
			$e.on("btap",".btnCreateContact",function(){
				brite.display("ContactCreate",{groupId:c.groupId}).done(function(contactCreate){
					contactCreate.onUpdate(function(){
						$e.trigger("MainScreen_CONTACTSPANEL_REFRESH");
					});
				});
			});
			
			$e.on("btap",".btnEdit",function(e){
				e.stopPropagation();
				var obj = $(this).bObjRef();
				brite.display("ContactCreate",{id:obj.id}).done(function(contactCreate){
					contactCreate.onUpdate(function(){
						refresh.call(c);
					});
				});
			});
			
			$e.on("btap",".btnDelete",function(e){
				e.stopPropagation();
				var $btn = $(this);
				var obj = $(this).bObjRef();
				var contactId = obj.id * 1;
				var dfd = $.Deferred();
				brite.dao.list("GroupContact",{match:{contact_id:contactId}}).done(function(contactGroups){
					if(contactGroups.length > 0){
						app.util.serialResolve(contactGroups,function(contactGroup){
							var innerDfd = $.Deferred();
							brite.dao.remove("GroupContact",contactGroup.id).done(function(){
								innerDfd.resolve();
							});
							
							return innerDfd.promise();
						}).done(function(){
							dfd.resolve();
						});
					}else{
						dfd.resolve();
					}
					
				});
				
				dfd.done(function(){
					var $item = $btn.closest(".contactItem");
					$item.fadeOut(function(){
						brite.dao.remove("Contact",contactId).done(function(){
							refresh.call(c);
						});
					});
				});
				
			});
			
			$e.on("btap",".btnSelectGroup",function(e){
				e.stopPropagation();
				var obj = $(this).bObjRef();
				brite.display("ContactGroups",{id:obj.id});
			});
			
			$e.on("btap",".contactItem",function(){
				var obj = $(this).bObjRef();
				brite.display("ContactInfo",{id:obj.id * 1,groupId:c.groupId});
			});
		}

		// --------- /Component Interface Implementation ---------- //

		// --------- Component Public API --------- //

		// --------- /Component Public API --------- //

		// --------- Component Private Methods --------- //
		function refresh(){
			var c = this;
			var $e = c.$element;
			var $contacts = $e.find(".contactsList").empty();
			brite.dao.invoke("getContactsByGroup","Contact",c.groupId).done(function(contacts){
				for (var i = 0; i < contacts.length; i++) {
					var contact = contacts[i];
					var html = $("#tmpl-ContactsPanel-contactItem").render(contact);
					$contacts.append($(html));
				}			
			});
			
		}
		// --------- /Component Private Methods --------- //

		// --------- Component Registration --------- //
		brite.registerComponent("ContactsPanel", {
			loadTmpl : true,
			emptyParent : true,
			transition : "slideRight",
			parent:".MainScreen-content"
		}, function() {
			return new ContactsPanel();
		});
		// --------- Component Registration --------- //

	})(jQuery);

})();
